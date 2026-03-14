from django.urls import path, include

urlpatterns = [
    path('', include('visits.urls')),
]
