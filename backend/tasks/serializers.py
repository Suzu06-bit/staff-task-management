from rest_framework import serializers
from .models import Staff, Category, Task, Submission


class StaffSerializer(serializers.ModelSerializer):
    class Meta:
        model = Staff
        fields = "__all__"


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = "__all__"


class SubmissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Submission
        fields = "__all__"


class TaskSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="category.name", read_only=True)
    staff_name = serializers.CharField(source="staff.name", read_only=True)
    staff_email = serializers.CharField(source="staff.email", read_only=True)
    submission = SubmissionSerializer(read_only=True)

    class Meta:
        model = Task
        fields = ["id", "title", "category", "category_name", "description",
                  "deadline", "staff", "staff_name", "staff_email",
                  "status", "created_at", "submission"]
        read_only_fields = ["status"]