from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('api/visits/', views.api_visits, name='api_visits'),
    path('api/visits/<int:visit_id>/', views.api_visit_delete, name='api_visit_delete'),
    path('api/votes/', views.api_votes, name='api_votes'),
]
