## YouTube Backend

This repository contains the backend code for a YouTube-like application. The project includes functionalities such as video upload, user authentication, and video playback.

## Table of Contents

Features
Installation
Usage
Configuration
API Endpoints
Technologies Used
Contributing
License
Contact
Features
User Authentication
Sign up, login, and logout
Video Management
Upload, update, and delete videos
Video Playback
Stream videos
Commenting System
Add, edit, and delete comments on

## Configuration

Make sure to set up the following environment variables in the .env file:

PORT: Port number for the server (default: 3000)
DATABASE_URL: Connection string for the database
JWT_SECRET: Secret key for JWT authentication

## API Endpoints

<-- Authentication -->
POST /api/auth/signup: Sign up a new user
POST /api/auth/login: Log in an existing user

<-- Videos -->
POST /api/videos: Upload a new video
GET /api/videos/:id: Get video details
PUT /api/videos/:id: Update a video
DELETE /api/videos/:id: Delete a video

<-- Comments -->
POST /api/videos/:id/comments: Add a comment to a video
PUT /api/comments/:id: Edit a comment
DELETE /api/comments/:id: Delete a comment

## Technologies Used

Node.js
Express.js
MongoDB
JWT for authentication

## Contact

For any inquiries, please contact Bibek Thapa.
email: bibekthapa00f@gmail.com
Thanks to chai aur code for an inspiration to this project.