# Daily Journal Web Application

## Overview

This is a full-stack web application for managing posts, built using **Express.js**, **PostgreSQL**, and **bcrypt** for secure password management. Users can create, edit, view, and delete posts after providing a password. This application is designed for managing personal journal entries in a secure and organized manner.

## Features

- **Create posts**: Users can write journal entries with titles and content.
- **View all posts**: Displays a list of all journal entries stored in the database.
- **Edit posts**: Post content can be updated with correct password authentication.
- **Delete posts**: Posts can be deleted after authenticating with the correct password.
- **Password protection**: Editing and deleting posts requires users to enter the correct password for each post.

## Technologies

- **Express.js**: Framework for routing and server-side logic.
- **PostgreSQL**: Database management system for storing and retrieving posts.
- **bcrypt**: Password hashing library for securely storing and comparing passwords.
- **EJS**: Templating engine for rendering dynamic HTML pages.

## Setup Instructions

### Prerequisites

Before starting, make sure you have the following installed on your local machine:

1. [Node.js](https://nodejs.org) (v14 or above)
2. A **PostgreSQL** database setup (either locally or using a cloud service like Render or Heroku)

### Installing Dependencies

To get the application up and running, clone the repository and install the required dependencies:

```bash
git clone https://github.com/yourusername/daily-journal.git
cd daily-journal
npm install
```

## Routes

Here’s a quick overview of the available routes and their functions:

- **`/`**: **GET** - Displays the homepage with a welcome message.
- **`/blogs`**: **GET** - Displays a list of all posts from the database.
- **`/new`**:
  - **GET** - Displays a form to create a new post.
  - **POST** - Accepts a new post, hashes the password, and saves it to the database.
- **`/blogs/:id`**: **GET** - Displays a specific post by ID.
- **`/blogs/:id/edit`**:
  - **GET** - Displays a password-protected page to edit the post.
  - **POST** - After entering the correct password, users can edit the post's content.
- **`/blogs/:id/delete`**:
  - **GET** - Displays a password-protected page to delete the post.
  - **POST** - After entering the correct password, the post is deleted.

## Running the Application Locally

1. Start your PostgreSQL database (ensure it’s running).
2. Run the following command to start the Express.js server locally:

```bash
npm start
```

3. The application will now be running at http://localhost:3000.
