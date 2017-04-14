from django.http import HttpResponse, JsonResponse
from django.shortcuts import render, redirect
from .models import *
from django.contrib.auth import authenticate, login, logout
from datetime import datetime

# Create your views here.

def home(request):
	if request.user.is_authenticated:
		all_topics = Topic.objects.all()
		return render(request, 'chat/home.html', {'all_topics': all_topics})
	else:
		return login_page(request)

def profile(request):
	if request.user.is_authenticated:
		return render(request, 'chat/profile.html')
	else:
		return login_page(request)

def login_page(request):
	if request.user.is_authenticated():
		return HttpResponse("<h1>Hello</h1>")
	return render(request, 'chat/login.html')

def checklogin(request):

	username = request.GET.get('username')
	password = request.GET.get('password')

	user = authenticate(username=username, password=password)
	success = (user is not None)

	if success:
		login(request, user)

	return JsonResponse({'success':success})

def logout_pressed(request):
	logout(request)
	return redirect('/')

def register(request):

	username = request.GET.get('username')
	password = request.GET.get('password')
	retype = request.GET.get('retype')

	match = (retype == password)
	taken = User.objects.filter(username=username).exists()

	if match and not taken:
		user = User.objects.create_user(username=username, password=password)
		user.save()
		profile = Profile(authenticated_user=user)
		profile.save()
		login(request, user)

	return JsonResponse({'match':match, 'taken':taken})

def newtopic(request):

	text = request.GET.get('new-topic')
	t = Topic(posted_by=request.user.user_profile, text=text, pub_date=datetime.now())
	t.save()

	return JsonResponse({'text':text})




