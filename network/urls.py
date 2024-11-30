
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),

    #Posts API's Paths

    path("posts", views.compose_post, name="post"),
    path("posts/<str:postField>", views.load_posts, name="posts"),

    #Followers API'S path
    path("followers/", views.set_follower, name="follow"),
    path("followers/<str:userName>", views.view_followers, name="follow"),
]
