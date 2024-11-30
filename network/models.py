from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    pass

class Tweet(models.Model):
    user = models.ForeignKey(User, related_name = "User_That_Tweeted", on_delete = models.CASCADE)
    body = models.TextField()
    likes = models.IntegerField(default = 0)
    timestamp = models.DateTimeField(auto_now_add=True)

    def serialize(self):
        return {
            "user": self.user.username,
            "tweet": self.body,
            "timestamp": self.timestamp.strftime("%b %d %Y, %I:%M %p"),
            "likes": self.likes,
        }
    
class Follower(models.Model):
    user = models.ForeignKey(User, related_name="Follower", on_delete=models.CASCADE)
    follows = models.ForeignKey("User", related_name="Follows", on_delete=models.CASCADE)

    def serialize(self):
        return {
            "user": self.user.username,
            "follows": self.follows.username
        }

class FollowerTweet(models.Model):
    pass
    
class LikedPost(models.Model):
    post = models.ForeignKey(Tweet, related_name = "Liked_Post", on_delete=models.CASCADE)

    def __str__(self):
        return self.post
