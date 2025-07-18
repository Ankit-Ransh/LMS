#!/bin/bash

# List all courses
curl -X GET http://localhost:4000/courses

echo -e "\n---\n"
# Get course details (replace 1 with actual course ID)
curl -X GET http://localhost:4000/courses/1

echo -e "\n---\n"
# Enroll in a course (replace <JWT_TOKEN> and 1 with actual values)
curl -X POST http://localhost:4000/courses/1/enroll \
  -H "Authorization: Bearer <JWT_TOKEN>" 