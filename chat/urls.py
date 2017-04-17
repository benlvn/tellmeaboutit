from django.conf.urls import url
from . import views

urlpatterns = [

	#Page request
	url(r'^$', views.home, name="homepage"),
	url(r'^logout$', views.logout_user, name="logout"),

	#Snippet Request
	url(r'^topic-display$', views.topic_display, name="topic-display"),
	url(r'^chat-list-item$', views.chat_list_item, name="chat-list-item"),

	#Data request
	url(r'^get-topics$', views.get_topics, name="get-topics"),
	url(r'^recieve-messages$', views.recieve_messages, name="recieve-messages"),

	#Form submission
	url(r'^login$', views.login_user, name="login"),
	url(r'^register$', views.register, name="register"),
	url(r'^new-topic$', views.new_topic, name="new-topic"),
	url(r'^new-message$', views.new_message, name="new-message"),

	
	url(r'^new-chat-window$', views.new_chat_window, name="newchat-window"),
	url(r'^open-chat-window$', views.open_chat_window, name="open-chat-window")
]