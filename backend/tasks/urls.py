from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (StaffViewSet, StaffDetailView, CategoryViewSet,TaskViewSet, DashboardView, SubmissionView)

router = DefaultRouter()
router.register("staff", StaffViewSet, basename="staff")
router.register("categories", CategoryViewSet, basename="category")
router.register("tasks", TaskViewSet, basename="task")

urlpatterns = [
    path("dashboard/", DashboardView.as_view()),
    path("staff/<int:id>/details/", StaffDetailView.as_view()),
    path("submit/<str:token>/", SubmissionView.as_view()),
    path("", include(router.urls)),
]