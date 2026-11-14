import os
from django.conf import settings
from django.core.mail import send_mail
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Staff, Category, Task, Submission
from .serializers import StaffSerializer, CategorySerializer, TaskSerializer


# Pending tasks whose deadline has passed become NOT_SUBMITTED
def update_status():
    Task.objects.filter(status="PENDING", deadline__lt=timezone.now()).update(status="NOT_SUBMITTED")


# ---------------- Staff ----------------
class StaffViewSet(viewsets.ModelViewSet):
    serializer_class = StaffSerializer

    def get_queryset(self):
        staff = Staff.objects.all().order_by("-id")

        search = self.request.query_params.get("search")
        if search:
            staff = staff.filter(name__icontains=search)

        is_active = self.request.query_params.get("is_active")
        if is_active == "true":
            staff = staff.filter(is_active=True)
        if is_active == "false":
            staff = staff.filter(is_active=False)
        return staff


class StaffDetailView(APIView):
    def get(self, request, id):
        update_status()
        staff = get_object_or_404(Staff, id=id)
        tasks = Task.objects.filter(staff=staff).order_by("-id")

        data = StaffSerializer(staff).data
        data["stats"] = {
            "total": tasks.count(),
            "pending": tasks.filter(status="PENDING").count(),
            "completed": tasks.filter(status="COMPLETED").count(),
            "not_submitted": tasks.filter(status="NOT_SUBMITTED").count(),
        }
        data["history"] = TaskSerializer(tasks, many=True).data
        return Response(data)


# ---------------- Category ----------------
class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all().order_by("-id")
    serializer_class = CategorySerializer


# ---------------- Task ----------------
class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer

    def get_queryset(self):
        update_status()
        tasks = Task.objects.all().order_by("-id")

        status = self.request.query_params.get("status")
        if status == "OVERDUE":
            status = "NOT_SUBMITTED"
        if status:
            tasks = tasks.filter(status=status)
        return tasks

    def perform_create(self, serializer):
        task = serializer.save()      # status = PENDING, token is auto generated

        link = f"{settings.FRONTEND_URL}/submit/{task.token}"
        message = f"""Hello {task.staff.name},

A new task has been assigned to you.

Title: {task.title}
Category: {task.category.name}
Description: {task.description}
Deadline: {task.deadline}
Status: {task.status}

Submit your work here:
{link}
"""
        try:
            send_mail(f"New Task: {task.title}", message,
                      settings.DEFAULT_FROM_EMAIL, [task.staff.email])
        except Exception as e:
            print("Email error:", e)


# ---------------- Dashboard ----------------
class DashboardView(APIView):
    def get(self, request):
        update_status()
        tasks = Task.objects.all()
        not_submitted = tasks.filter(status="NOT_SUBMITTED").count()
        recent = tasks.order_by("-id")[:5]

        return Response({
            "total": tasks.count(),
            "pending": tasks.filter(status="PENDING").count(),
            "completed": tasks.filter(status="COMPLETED").count(),
            "not_submitted": not_submitted,
            "overdue": not_submitted,
            "recent": TaskSerializer(recent, many=True).data,
        })


# ---------------- Staff submits task using the email link ----------------
ALLOWED_FILES = [".pdf", ".doc", ".docx", ".xls", ".xlsx", ".png", ".jpg", ".jpeg", ".zip", ".txt"]


class SubmissionView(APIView):
    permission_classes = [AllowAny]       # staff has no login, the token protects the link
    authentication_classes = []

    def get(self, request, token):
        update_status()
        task = get_object_or_404(Task, token=token)
        return Response({
            "title": task.title,
            "category": task.category.name,
            "description": task.description,
            "assigned_date": task.created_at,
            "deadline": task.deadline,
            "status": task.status,
        })

    def post(self, request, token):
        task = get_object_or_404(Task, token=token)

        if task.status == "COMPLETED":
            return Response({"detail": "This task is already submitted."}, status=400)

        if task.deadline < timezone.now():
            task.status = "NOT_SUBMITTED"
            task.save()
            return Response({"detail": "Deadline has passed. Submission is closed."}, status=400)

        comment = request.data.get("comment", "").strip()
        document = request.FILES.get("document")

        if comment == "":
            return Response({"detail": "Comment is required."}, status=400)
        if document is None:
            return Response({"detail": "Please upload a document."}, status=400)

        extension = os.path.splitext(document.name)[1].lower()
        if extension not in ALLOWED_FILES:
            return Response({"detail": "File type not allowed."}, status=400)
        if document.size > 5 * 1024 * 1024:
            return Response({"detail": "File is too large. Maximum 5 MB."}, status=400)

        Submission.objects.create(task=task, staff=task.staff, comment=comment, document=document)
        task.status = "COMPLETED"
        task.save()
        return Response({"detail": "Task submitted successfully."}, status=201)