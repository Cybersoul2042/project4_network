import json
from django.http import JsonResponse
from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse
from django.views.decorators.csrf import csrf_exempt
from django.db.models import QuerySet


from .models import User, Tweet, Follower, LikedPost, FollowerTweet


def index(request):
    tweets = Tweet.objects.all()
    return render(request, "network/index.html",{
        "tweets": tweets
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
    elif postField.find('user'):
        return JsonResponse({"error": "Invalid PostField."}, status=400)
    else:
        return JsonResponse({"error": "Invalid PostField."}, status=400)

    tweets = tweets.order_by("-timestamp").all()
    return JsonResponse([tweet.serialize() for tweet in tweets], safe=False)

def view_followers(request, userName):
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

