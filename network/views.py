import json
from django.http import JsonResponse
from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse
from django.views.decorators.csrf import csrf_exempt
from django.db.models import QuerySet


from .models import User, Tweet, Follower, LikedPost


def index(request):
    tweets = Tweet.objects.all()
    return render(request, "network/index.html",{
        "tweets": tweets
    })

def view_profile(request, userName):
    userAccount = User.objects.get(username = userName)
    userFollowers = Follower.objects.filter(follows = userAccount).count()
    userFollowings = Follower.objects.filter(user = userAccount).count()
    return render(request, "network/profile.html", {
        "userDets": userAccount,
        "followers": userFollowers,
        "followings": userFollowings
    })

@csrf_exempt
def set_follower(request):
    if request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=400)
    data = json.loads(request.body)

    body = data.get("body", "")
    follower = Follower.objects.create(user = request.user, follows = User.objects.get(username = body))
        
    return JsonResponse({"message": "User was followed succsesfully"}, status=201)


@csrf_exempt
def compose_post(request):
    if request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=400)
    
    data = json.loads(request.body)

    body = data.get("body", "")
    
    tweet = Tweet.objects.create(user = request.user, body = body)

    return JsonResponse({"message": "Tweet posted successfully."}, status=201)

def load_posts(request, postField):
    
    if postField == "all":
        tweets = Tweet.objects.all()
    elif postField == "following":
        following_users = Follower.objects.filter(user=request.user).values_list('follows', flat=True)
        tweets = Tweet.objects.filter(user__in=following_users)

    tweets = tweets.order_by("-timestamp").all()
    return JsonResponse([tweet.serialize() for tweet in tweets], safe=False)

def load_likedPosts(request, postUser):
    if(User.objects.filter(username = postUser) is not None):
        user = User.objects.get(username = postUser)
        likedtweets = LikedPost.objects.filter(user = user).values_list('post', flat=True)
        tweets = Tweet.objects.filter(pk__in=likedtweets)
    else:
        return JsonResponse({"error": "No User of this username Found"}, status=404)

    tweets = tweets.order_by("-timestamp").all()
    return JsonResponse([tweet.serialize() for tweet in tweets], safe=False)

def load_userPosts(request, userName):
    userAccount = User.objects.get(username = userName)
    tweets = Tweet.objects.filter(user = userAccount)

    tweets = tweets.order_by("-timestamp").all()
    return JsonResponse([tweet.serialize() for tweet in tweets], safe=False)

@csrf_exempt
def post(request, postId):
    try:
        tweet = Tweet.objects.get(pk = postId)
    except Tweet.DoesNotExist:
        return JsonResponse({"error": "Tweet not found."}, status=404)
    

    if request.method == "PUT":
        data = json.loads(request.body)
        if data.get('likes') is not None:
            
            if LikedPost.objects.filter(user = request.user,post = Tweet.objects.get(pk = postId)).first() is not None:
                oldLikedPost = LikedPost.objects.get(user = request.user, post = Tweet.objects.get(pk = postId))
                oldLikedPost.delete()
                tweet.likes = data.get('likes')
                tweet.save()
            else:
                newLikedPost = LikedPost.objects.create(user = request.user ,post = Tweet.objects.get(pk = postId))
                tweet.likes = data.get('likes')
                tweet.save()
            
        else:
            tweet.body = data['tweet']
            tweet.save()
        return JsonResponse({'message': "Post have been liked succesefully"}, status=201)
    
    elif request.method == "GET":
        return JsonResponse(tweet.serialize())
    else:
        return JsonResponse({
            "error": "GET or PUT request required."
        }, status=400)
        

@csrf_exempt
def view_followers(request, userName):
    if request.method == "POST":
        data = json.loads(request.body)
        body = data.get("body", "")
        follower = Follower.objects.get(user = request.user, follows = User.objects.get(username = body))
        follower.delete()
    

    followers = Follower.objects.filter(user = User.objects.get(username = userName))

    return JsonResponse([follower.serialize() for follower in followers], safe=False)

def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")

