from django.http import HttpResponse, JsonResponse
from django.shortcuts import render, redirect
from django.template.loader import render_to_string
from .models import *
from django.contrib.auth import authenticate, login, logout
from datetime import datetime

# Create your views here.

###
### Pages
###

def home(request):

	# If user is logged in, return the homepage
	# Else return the login page
	if request.user.is_authenticated:
		return render(request, 'chat/home.html')
	else:
		return login_page(request)


def login_page(request):
	return render(request, 'chat/login.html')

def logout(request):
	logout(request)
	return redirect('/')



###
### Forms
###

def login_user(request):

	# Data recieved
	username = request.GET.get('username')
	password = request.GET.get('password')


	# Check Login
	user = authenticate(username=username, password=password)
	success = (user is not None)

	# Login if valid
	if success:
		login(request, user)

	# Send success/failure
	return JsonResponse({'success':success})

def register(request):

	# Data recieved
	username = request.GET.get('username')
	password = request.GET.get('password')
	retype = request.GET.get('retype')

	# Data to send
	match = (retype == password)
	taken = User.objects.filter(username=username).exists()

	if match and not taken:

		# Create new user
		user = User.objects.create_user(username=username, password=password)
		user.save()

		# Create user's profile
		profile = Profile(authenticated_user=user)
		profile.save()

		# Log user in
		login(request, user)

	return JsonResponse({'match':match, 'taken':taken})

def new_topic(request):

	# Data recieved and to send
	text = request.GET.get('new-topic')

	# Create new topic
	t = Topic(posted_by=request.user.user_profile, text=text, pub_date=datetime.now(), on_board=True)
	t.save()

	return JsonResponse({'text':text})


def new_message(request):

	# Data recieved
	text = request.GET.get('message')
	topic_id = request.GET.get('topic_id')
	chat_id = request.GET.get('chat_id')

	profile = request.user.user_profile

	if chat_id == "null":
		# Create new chat if needed
		chat = Chat(topic=Topic.objects.get(id=topic_id), 
					outside_user=profile)
		chat_id = chat.id
		chat.save()


	chat = Chat.objects.get(id=chat_id)
	
	# Create new message
	message = Message(chat=chat, text=text, pub_date=datetime.now(), sender=profile)
	message.save()

	return updatechat(request)



###
### Render windows
###

def chat_window(request, chat):
	return render_to_string('chat/includes/chat_window.html', {'chat': chat})

def newchat_window(request):

	topic_id = request.GET.get('id')
	topic = Topic.objects.get(id=topic_id)

	return JsonResponse({'chat-window': chat_window(request, Chat(topic=topic))})

def topic_display(request):
	
	topic_id = request.GET.get('id')
	print(topic_id)
	topic = Topic.objects.get(id=topic_id)

	return JsonResponse( 
		{'topic-display': render_to_string('chat/includes/topic.html', {'topic': topic}), 
		'col': request.GET.get('col') })


###
### Update Information
###

def updatechat(request):

	# Find all chats the user belongs to
	all_chats = Chat.objects.filter(outside_user=request.user.user_profile) | Chat.objects.filter(topic__posted_by=request.user.user_profile)

	# Keys are chat id, values are a list of messages
	chats_dict = {}

	for chat in all_chats:

		# List of message dictionaries
		# Contains sender, text, and seen info
		messages = []

		for message in chat.messages.order_by('pub_date'):
			info = {}
			info['sender'] = message.sender
			info['text'] = message.text
			info['seen'] = message.seen
			messages += [info]

		chats_dict[chat.id] = messages
	

	return JsonResponse({'chats': chats_dict})



def get_topics(request):

	# List of topics
	# Each topic is represented by a dictionary
	# Contains id infor
	json_dictionary = {'topics': []}

	for topic in Topic.objects.all().order_by('-pub_date'):

		# Display topic if it's on the board
		# and created by a different user
		if topic.on_board and topic.posted_by != request.user.user_profile:
			info = {}
			info['id'] = topic.id
			json_dictionary['topics'].append(info)


	return JsonResponse(json_dictionary)







