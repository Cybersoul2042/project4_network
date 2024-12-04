from django.contrib import admin

from .models import User, Tweet, Follower, LikedPost

# Register your models here.

class TweetAdmin(admin.ModelAdmin):
    tweet_list = ["user", "tweet", "likes", "timestamp"]
class FollowerAdmin(admin.ModelAdmin):
    follower_list = ["user", "follows"]
class LikedAdmin(admin.ModelAdmin):
    liked_list = ["post"]

admin.site.register(Tweet, TweetAdmin)
admin.site.register(Follower, FollowerAdmin)
admin.site.register(LikedPost, LikedAdmin)