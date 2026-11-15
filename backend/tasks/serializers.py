from django.contrib.auth import authenticate
from django.utils import timezone
from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken  # makes the login token

from .models import Staff, Category, Task, Submission


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        user = authenticate(
            username=data["username"],
            password=data["password"]
        )

        if user is None:
            raise serializers.ValidationError(
                "Invalid username or password."
            )

        if not user.is_staff:
            raise serializers.ValidationError(
                "Only admin can log in."
            )

        refresh = RefreshToken.for_user(user)

        return {
            "message": "Login successful.",
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
            },
            "tokens": {
                "access_token": str(refresh.access_token),
                "refresh_token": str(refresh),
            }
        }


class StaffSerializer(serializers.ModelSerializer):
    class Meta:
        model = Staff

        fields = [
            "id",
            "name",
            "email",
            "phone",
            "role",
            "is_active",
            "created_at",
        ]


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category

        fields = [
            "id",
            "name",
            "description",
        ]


class SubmissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Submission

        fields = [
            "id",
            "comment",
            "document",
            "submitted_at",
        ]


class TaskSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(
        source="category.name",
        read_only=True
    )

    staff_name = serializers.CharField(
        source="staff.name",
        read_only=True
    )

    staff_email = serializers.CharField(
        source="staff.email",
        read_only=True
    )

    submission = SubmissionSerializer(
        read_only=True,
        allow_null=True
    )

    class Meta:
        model = Task

        fields = [
            "id",
            "title",
            "category",
            "category_name",
            "description",
            "deadline",
            "staff",
            "staff_name",
            "staff_email",
            "status",
            "created_at",
            "submission",
        ]

        # the admin can never choose the status, the backend sets it
        read_only_fields = ["status"]

    # deadline must be in the future
    def validate_deadline(self, value):
        if value <= timezone.now():
            raise serializers.ValidationError(
                "Deadline must be in the future."
            )
        return value

    # inactive staff can not get tasks
    def validate_staff(self, value):
        if not value.is_active:
            raise serializers.ValidationError(
                "This staff member is inactive."
            )
        return value