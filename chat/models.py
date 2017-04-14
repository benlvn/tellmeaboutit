from django.db import models
from django.contrib.auth.models import User

class profile(models.Model):
	authenticated_user = models.OneToOneField(User, related_name="user_profile")

class topic(models.Model):
	posted_by = models.ManyToOneField(profile, related_name="topics_posted")

	text = models.CharField()

	pub_date = models.DateTimeField()

