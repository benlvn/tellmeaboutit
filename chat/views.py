from django.http import HttpResponse, JsonResponse
from django.shortcuts import render, redirect
from django.template.loader import render_to_string
from .models import *
from django.contrib.auth import authenticate, login, logout
from datetime import datetime
from django.db.models import Q

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

def newchat(request):

	topic_id = request.GET.get('id')
	topic = Topic.objects.get(id=topic_id)
	outside_user = Profile.objects.get(id=request.user.user_profile.id)
	chat = Chat(topic=topic, outside_user=outside_user)
	chat.save()

	return JsonResponse({'chat-window': chat_window(request, chat)})

def chat_window(request, chat):
	return render_to_string('chat/includes/chat_window.html', {'chat': chat})

def new_message(request):

	text = request.GET.get('message')
	chat = Chat.objects.get(id=request.GET.get('id'))
	profile = request.user.user_profile
	message = Message(chat=chat, text=text, pub_date=datetime.now(), sender=profile)
	message.save()

	return JsonResponse({'chat-window': chat_window(request, chat)})

def updatechat(request):
	all_chats = Chat.objects.filter(outside_user=request.user.user_profile) | Chat.objects.filter(topic__posted_by=request.user.user_profile)
	
	chat_windows = []
	for chat in all_chats:
		chat_windows.append(chat_window(request, chat))
	

	return JsonResponse({'chat-windows': chat_windows})






