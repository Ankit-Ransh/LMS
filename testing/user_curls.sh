#!/bin/bash
# List user enrollments
curl -X GET http://localhost:4000/me/enrollments \
  -H "Authorization: Bearer <JWT_TOKEN>"

echo -e "\n---\n"
# Get user progress
curl -X GET http://localhost:4000/me/progress \
  -H "Authorization: Bearer <JWT_TOKEN>"

echo -e "\n---\n"
# Update progress (replace courseId, lessonId, status as needed)
curl -X POST http://localhost:4000/me/progress \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"courseId": 1, "lessonId": 1, "status": "completed"}' 