import json
import os

from django.conf import settings
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.core import signing
from django.core.mail import send_mail
from django.http import HttpResponse, JsonResponse
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.utils.dateparse import parse_datetime
from django.views.decorators.csrf import csrf_exempt

from .models import Staff, Category, Task, Submission


# ---------------- Helper functions ----------------

# read JSON sent by React
def get_data(request):
    try:
        return json.loads(request.body)
    except ValueError:
        return {}


# error message for React
def error(message, status=400):
    return JsonResponse({"detail": message}, status=status)


# Pending tasks whose deadline has passed become NOT_SUBMITTED
def update_status():
    Task.objects.filter(status="PENDING", deadline__lt=timezone.now()).update(status="NOT_SUBMITTED")


# turn database objects into dictionaries (so we can send them as JSON)
def staff_dict(staff):
    return {
        "id": staff.id,
        "name": staff.name,
        "email": staff.email,
        "phone": staff.phone,
        "role": staff.role,
        "is_active": staff.is_active,
        "created_at": staff.created_at,
    }


def category_dict(category):
    return {
        "id": category.id,
        "name": category.name,
        "description": category.description,
        "created_at": category.created_at,
    }


def task_dict(task, request):
    submission = None
    s = Submission.objects.filter(task=task).first()
    if s:
        submission = {
            "id": s.id,
            "comment": s.comment,
            "document": request.build_absolute_uri(s.document.url),
            "submitted_at": s.submitted_at,
        }

    return {
        "id": task.id,
        "title": task.title,
        "category": task.category.id,
        "category_name": task.category.name,
        "description": task.description,
        "deadline": task.deadline,
        "staff": task.staff.id,
        "staff_name": task.staff.name,
        "staff_email": task.staff.email,
        "status": task.status,
        "created_at": task.created_at,
        "submission": submission,
    }


# ---------------- Login and token ----------------

# check the token sent by React: Authorization: Bearer <token>
def get_admin(request):
    header = request.headers.get("Authorization", "")

    if not header.startswith("Bearer "):
        return None

    token = header[7:]

    try:
        data = signing.loads(token, max_age=60 * 60 * 24)   # token is valid for 1 day
    except signing.BadSignature:
        return None

    return User.objects.filter(id=data["user_id"], is_staff=True).first()


# put @admin_required above a view to protect it
def admin_required(view):
    def wrapper(request, *args, **kwargs):
        if get_admin(request) is None:
            return error("Authentication credentials were not provided.", 401)
        return view(request, *args, **kwargs)
    return wrapper


@csrf_exempt
def login_view(request):
    if request.method != "POST":
        return error("Only POST is allowed.", 405)

    data = get_data(request)
    user = authenticate(username=data.get("username"), password=data.get("password"))

    if user is None or not user.is_staff:
        return error("Invalid username or password.")

    token = signing.dumps({"user_id": user.id})
    return JsonResponse({"access": token})


# ---------------- Staff ----------------

# fill the staff object from React data and save it
def save_staff(staff, data):
    for field in ["name", "email", "phone", "role"]:
        if field in data:
            setattr(staff, field, str(data[field]).strip())

    if "is_active" in data:
        staff.is_active = bool(data["is_active"])

    if staff.name == "" or staff.email == "" or staff.phone == "" or staff.role == "":
        return "All fields are required."

    if "@" not in staff.email:
        return "Enter a valid email address."

    if Staff.objects.filter(email=staff.email).exclude(pk=staff.pk).exists():
        return "Staff with this email already exists."

    staff.save()
    return None


@csrf_exempt
@admin_required
def staff_list(request):
    if request.method == "GET":
        staff = Staff.objects.all().order_by("-id")

        search = request.GET.get("search")
        if search:
            staff = staff.filter(name__icontains=search)

        is_active = request.GET.get("is_active")
        if is_active == "true":
            staff = staff.filter(is_active=True)
        if is_active == "false":
            staff = staff.filter(is_active=False)

        return JsonResponse([staff_dict(s) for s in staff], safe=False)

    if request.method == "POST":
        staff = Staff()
        message = save_staff(staff, get_data(request))
        if message:
            return error(message)
        return JsonResponse(staff_dict(staff), status=201)

    return error("Method not allowed.", 405)


@csrf_exempt
@admin_required
def staff_detail(request, id):
    staff = get_object_or_404(Staff, id=id)

    if request.method == "GET":
        return JsonResponse(staff_dict(staff))

    if request.method in ["PUT", "PATCH"]:
        message = save_staff(staff, get_data(request))
        if message:
            return error(message)
        return JsonResponse(staff_dict(staff))

    if request.method == "DELETE":
        staff.delete()
        return HttpResponse(status=204)

    return error("Method not allowed.", 405)


@admin_required
def staff_details(request, id):
    update_status()
    staff = get_object_or_404(Staff, id=id)
    tasks = Task.objects.filter(staff=staff).order_by("-id")

    data = staff_dict(staff)
    data["stats"] = {
        "total": tasks.count(),
        "pending": tasks.filter(status="PENDING").count(),
        "completed": tasks.filter(status="COMPLETED").count(),
        "not_submitted": tasks.filter(status="NOT_SUBMITTED").count(),
    }
    data["history"] = [task_dict(t, request) for t in tasks]
    return JsonResponse(data)


# ---------------- Category ----------------

def save_category(category, data):
    if "name" in data:
        category.name = str(data["name"]).strip()
    if "description" in data:
        category.description = str(data["description"]).strip()

    if category.name == "" or category.description == "":
        return "Name and description are required."

    if Category.objects.filter(name=category.name).exclude(pk=category.pk).exists():
        return "Category with this name already exists."

    category.save()
    return None


@csrf_exempt
@admin_required
def category_list(request):
    if request.method == "GET":
        categories = Category.objects.all().order_by("-id")
        return JsonResponse([category_dict(c) for c in categories], safe=False)

    if request.method == "POST":
        category = Category()
        message = save_category(category, get_data(request))
        if message:
            return error(message)
        return JsonResponse(category_dict(category), status=201)

    return error("Method not allowed.", 405)


@csrf_exempt
@admin_required
def category_detail(request, id):
    category = get_object_or_404(Category, id=id)

    if request.method == "GET":
        return JsonResponse(category_dict(category))

    if request.method in ["PUT", "PATCH"]:
        message = save_category(category, get_data(request))
        if message:
            return error(message)
        return JsonResponse(category_dict(category))

    if request.method == "DELETE":
        category.delete()
        return HttpResponse(status=204)

    return error("Method not allowed.", 405)


# ---------------- Task ----------------

def send_task_email(task):
    link = f"{settings.FRONTEND_URL}/submit/{task.token}"
    message = f"""Hello {task.staff.name},

A new task has been assigned to you.

Title: {task.title}
Category: {task.category.name}
Description: {task.description}
Deadline: {timezone.localtime(task.deadline).strftime("%d %b %Y, %I:%M %p")}
Status: {task.status}

Submit your work here:
{link}
"""
    try:
        send_mail(f"New Task: {task.title}", message,
                  settings.DEFAULT_FROM_EMAIL, [task.staff.email])
    except Exception as e:
        print("Email error:", e)


@csrf_exempt
@admin_required
def task_list(request):
    if request.method == "GET":
        update_status()
        tasks = Task.objects.all().order_by("-id")

        status = request.GET.get("status")
        if status == "OVERDUE":
            status = "NOT_SUBMITTED"
        if status:
            tasks = tasks.filter(status=status)

        return JsonResponse([task_dict(t, request) for t in tasks], safe=False)

    if request.method == "POST":
        data = get_data(request)

        title = str(data.get("title", "")).strip()
        description = str(data.get("description", "")).strip()

        if title == "" or description == "":
            return error("Title and description are required.")

        category = Category.objects.filter(id=data.get("category")).first()
        if category is None:
            return error("Please select a valid category.")

        staff = Staff.objects.filter(id=data.get("staff")).first()
        if staff is None:
            return error("Please select a valid staff member.")
        if not staff.is_active:
            return error("This staff member is inactive.")

        deadline = parse_datetime(str(data.get("deadline", "")))
        if deadline is None:
            return error("Enter a valid deadline.")
        if timezone.is_naive(deadline):
            deadline = timezone.make_aware(deadline)
        if deadline <= timezone.now():
            return error("Deadline must be in the future.")

        # status = PENDING and token are created automatically
        task = Task.objects.create(
            title=title,
            category=category,
            description=description,
            deadline=deadline,
            staff=staff,
        )

        send_task_email(task)
        return JsonResponse(task_dict(task, request), status=201)

    return error("Method not allowed.", 405)


@admin_required
def task_detail(request, id):
    update_status()
    task = get_object_or_404(Task, id=id)
    return JsonResponse(task_dict(task, request))


# ---------------- Dashboard ----------------

@admin_required
def dashboard_view(request):
    update_status()
    tasks = Task.objects.all()
    not_submitted = tasks.filter(status="NOT_SUBMITTED").count()
    recent = tasks.order_by("-id")[:5]

    return JsonResponse({
        "total": tasks.count(),
        "pending": tasks.filter(status="PENDING").count(),
        "completed": tasks.filter(status="COMPLETED").count(),
        "not_submitted": not_submitted,
        "overdue": not_submitted,
        "recent": [task_dict(t, request) for t in recent],
    })


# ---------------- Staff submits task using the email link (no login) ----------------

ALLOWED_FILES = [".pdf", ".doc", ".docx", ".xls", ".xlsx", ".png", ".jpg", ".jpeg", ".zip", ".txt"]


@csrf_exempt
def submit_view(request, token):
    update_status()
    task = Task.objects.filter(token=token).first()

    if task is None:
        return error("Invalid submission link.", 404)

    if request.method == "GET":
        return JsonResponse({
            "title": task.title,
            "category": task.category.name,
            "description": task.description,
            "assigned_date": task.created_at,
            "deadline": task.deadline,
            "status": task.status,
        })

    if request.method == "POST":
        if task.status == "COMPLETED":
            return error("This task is already submitted.")

        if task.deadline < timezone.now():
            task.status = "NOT_SUBMITTED"
            task.save()
            return error("Deadline has passed. Submission is closed.")

        comment = request.POST.get("comment", "").strip()
        document = request.FILES.get("document")

        if comment == "":
            return error("Comment is required.")
        if document is None:
            return error("Please upload a document.")

        extension = os.path.splitext(document.name)[1].lower()
        if extension not in ALLOWED_FILES:
            return error("File type not allowed.")
        if document.size > 5 * 1024 * 1024:
            return error("File is too large. Maximum 5 MB.")

        Submission.objects.create(task=task, staff=task.staff, comment=comment, document=document)
        task.status = "COMPLETED"
        task.save()
        return JsonResponse({"detail": "Task submitted successfully."}, status=201)

    return error("Method not allowed.", 405)