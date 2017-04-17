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
		all_chats = Chat.objects.filter(outside_user=request.user.user_profile) | Chat.objects.filter(topic__posted_by=request.user.user_profile).order_by('-updated_at')
		for chat in all_chats:
			print(chat.topic.text)
			print(chat.updated_at)
			print(chat.unseen_by)
		return render(request, 'chat/home.html', {'chats':all_chats})
	else:
		return login_page(request)


def login_page(request):
	return render(request, 'chat/login.html')

def logout_user(request):
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
	color = request.GET.get('color')

	# Create new topic
	t = Topic(color=color, posted_by=request.user.user_profile, text=text, pub_date=datetime.now(), on_board=True)
	t.save()

	return JsonResponse({'text':text})


def new_message(request):

	# Data recieved
	text = request.GET.get('text')
	chat_id = request.GET.get('chat_id')

	profile = request.user.user_profile

	if chat_id.startswith('new'):
		# Create new chat if needed
		topic_id = chat_id[4:]
		chat = Chat(topic=Topic.objects.get(id=topic_id), 
					outside_user=profile, updated_at=datetime.now())
		chat.save()
		chat_id = chat.id

	chat = Chat.objects.get(id=chat_id)
	
	# Create new message
	sent_at = datetime.now()
	message = Message(chat=chat, text=text, pub_date=sent_at, sender=profile)
	message.save()

	chat.updated_at = sent_at

	if profile == chat.outside_user:
		chat.unseen_by = chat.topic.posted_by
	else:
		chat.unseen_by = chat.outside_user

	chat.save()

	return JsonResponse({'chat_id': chat_id, 'topic_id': chat.topic.id, 
						'chat-list-item': render_to_string('chat/includes/chat_list_item.html', {'chat':chat}, request=request)})



###
### Render windows
###

def chat_window(request, chat):
	return render_to_string('chat/includes/chat_window.html', {'chat': chat}, request=request)

def open_chat_window(request):

	chat_id = request.GET.get('id')
	chat = Chat.objects.get(id=chat_id)

	if chat.unseen_by == request.user.user_profile:
		chat.unseen_by = None

	chat.save()

	return JsonResponse({'chat-window':chat_window(request, chat)})

def new_chat_window(request):

	topic_id = request.GET.get('id')
	topic = Topic.objects.get(id=topic_id)

	return JsonResponse({'chat-window': chat_window(request, Chat(topic=topic))})

def topic_display(request):
	
	topic_id = request.GET.get('id')
	topic = Topic.objects.get(id=topic_id)

	return JsonResponse( 
		{'topic-display': render_to_string('chat/includes/topic.html', {'topic': topic}), 
		'col': request.GET.get('col') })

def chat_list_item(request):

	# Data recieved
	chat_id = request.GET.get('chat_id')

	chat = Chat.objects.get(id=chat_id)

	return JsonResponse({'chat-list-item': render_to_string('chat/includes/chat_list_item.html', {'chat':chat}, request=request)})


###
### Update Information
###

def get_topics(request):

	# List of topics
	# Each topic is represented by a dictionary
	# Contains id info
	json_dictionary = {'topics': []}

	chats_joined = request.user.user_profile.chats_joined.all()

	topics_not_discussed = Topic.objects.all().order_by('-pub_date').exclude(on_board=False).exclude(posted_by=request.user.user_profile).exclude(id__in=chats_joined.values('topic_id'))

	for topic in topics_not_discussed:

		# Display topic if it's on the board
		# and created by a different user
		# and the user hasn't already chatted about it
		info = {}
		info['id'] = topic.id
		json_dictionary['topics'].append(info)


	return JsonResponse(json_dictionary)


def recieve_messages(request):

	profile = request.user.user_profile

	# Chats user belongs to
	chats = profile.chats_joined.all() | Chat.objects.all().filter(topic__in = profile.topics_posted.all())

	# Unrecieved messages
	unrecieved = Message.objects.filter(chat__in=chats).exclude(sender=profile).exclude(recieved=True).order_by('-pub_date')

	messages = []

	for message in unrecieved:
		obj = {}
		obj['text'] = message.text
		obj['chat_id'] = message.chat.id
		messages += [obj]
		message.recieved = True
		message.save()




	return JsonResponse({'messages':messages})






