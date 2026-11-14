from django.contrib import admin
from .models import Staff, Category, Task, Submission

admin.site.register(Staff)
admin.site.register(Category)
admin.site.register(Task)
admin.site.register(Submission)