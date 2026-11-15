from django.urls import path

from .views import (
    login_view,
    dashboard_view,
    staff_list,
    staff_detail,
    staff_details,
    category_list,
    category_detail,
    task_list,
    task_detail,
    submit_view,
)

urlpatterns = [
    path("auth/login/", login_view, name="login"),
    path("dashboard/", dashboard_view, name="dashboard"),

    path("staff/", staff_list, name="staff_list"),
    path("staff/<int:id>/", staff_detail, name="staff_detail"),
    path("staff/<int:id>/details/", staff_details, name="staff_details"),

    path("categories/", category_list, name="category_list"),
    path("categories/<int:id>/", category_detail, name="category_detail"),

    path("tasks/", task_list, name="task_list"),
    path("tasks/<int:id>/", task_detail, name="task_detail"),

    path("submit/<str:token>/", submit_view, name="submit"),
]