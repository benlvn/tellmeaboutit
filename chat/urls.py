from django.conf.urls import url
from . import views

urlpatterns = [
	url(r'^$', views.home, name="homepage"),
	url(r'^profile$', views.profile, name="profile"),
	url(r'^checklogin$', views.checklogin, name="checklogin"),
	url(r'^register$', views.register, name="register"),
	url(r'^logout$', views.logout_pressed, name="logout"),
	url(r'^newtopic$', views.newtopic, name="newtopic")
]