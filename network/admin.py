from django.contrib import admin

from .models import User, Tweet, Follower

# Register your models here.

class TweetAdmin(admin.ModelAdmin):
    tweet_list = ["user", "tweet", "likes", "timestamp"]
class FollowerAdmin(admin.ModelAdmin):
    follower_list = ["user", "follows"]

admin.site.register(Tweet, TweetAdmin)
admin.site.register(Follower, FollowerAdmin)