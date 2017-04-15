from django.db import models
from django.contrib.auth.models import User

class Profile(models.Model):
	authenticated_user = models.OneToOneField(User, related_name="user_profile")


class Topic(models.Model):
	posted_by = models.ForeignKey(Profile, related_name="topics_posted")

	text = models.CharField(max_length=100)

	pub_date = models.DateTimeField()

class Chat(models.Model):
	topic = models.ForeignKey(Topic, related_name="chats")
	outside_user = models.ForeignKey(Profile, related_name="chats_joined")

class Message(models.Model):
	chat = models.ForeignKey(Chat, related_name="messages")
	text = models.CharField(max_length=500)
	pub_date = models.DateTimeField()
	sender = models.ForeignKey(Profile, related_name="sent_messages")
