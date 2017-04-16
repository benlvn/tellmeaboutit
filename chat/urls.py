from django.conf.urls import url
from . import views

urlpatterns = [

	#Page request
	url(r'^$', views.home, name="homepage"),
	url(r'^logout$', views.logout, name="logout"),

	#Snippet Request
	url(r'^topic-display$', views.topic_display, name="topic-display"),

	#Data request
	url(r'^get-topics$', views.get_topics, name="get-topics"),
	url(r'^update-chats$', views.updatechat, name="updatechat"),

	#Form submission
	url(r'^login$', views.login_user, name="login"),
	url(r'^register$', views.register, name="register"),
	url(r'^new-topic$', views.new_topic, name="new-topic"),
	url(r'^new-message$', views.new_message, name="new-message"),

	
	url(r'^newchat-window$', views.newchat_window, name="newchat-window")
]