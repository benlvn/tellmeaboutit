from django.http import HttpResponse

# Create your views here.

def home(request):
	return HttpResponse('<h1>Home</h1>')

def profile(request):
	return HttpResponse('<h1>Profile</h1>')