
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("profile/<str:userName>", views.view_profile, name="profilePage"),

    #Posts API's Paths

    path("posts", views.compose_post, name="posts"),
    path("posts/<int:postId>", views.post, name="EachPost"),
    path("posts/likedposts-<str:postUser>", views.load_likedPosts, name="LikedPosts"),
    path("posts/profile-<str:userName>", views.load_userPosts, name="userPosts"),
    path("posts/<str:postField>", views.load_posts, name="TypeofPost"),
    
    

    #Followers API'S path
    path("followers/", views.set_follower, name="follow"),
    path("followers/<str:userName>", views.view_followers, name="follow"),
]
