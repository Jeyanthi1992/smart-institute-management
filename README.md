# Smart Institute Management System

A web-based Institute Management System built using Next.js, TypeScript, React, Tailwind CSS, and MySQL.

## Project Overview

Smart Institute Management System helps manage institute activities through a centralized dashboard. It provides modules to manage students, teachers, courses, attendance, and fees.

## Features

- Admin Login and Authentication
- Dashboard with Summary
- Student Management (CRUD)
- Teacher Management (CRUD)
- Course Management (CRUD)
- Attendance Management
- Fees Management
- MySQL Database Integration
- Responsive User Interface

## Technologies Used

- Frontend: Next.js, React, TypeScript
- Styling: Tailwind CSS
- Backend: Next.js API Routes
- Database: MySQL
- Authentication: JWT, bcryptjs
- Tools: VS Code, Git, GitHub

## Installation and Setup

1. Clone the repository:

   `git clone https://github.com/Jeyanthi1992/smart-institute-management.git`

2. Navigate to the project folder:

   `cd smart-institute-management`

3. Install dependencies:

   `npm install`

4. Create a `.env.local` file in the root folder and configure:

   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=smart_institute_db
   JWT_SECRET=your_secret_key
   ```

5. Create the MySQL database named `smart_institute_db` and configure the required tables.

6. Start the development server:

   `npm run dev`

7. Open http://localhost:3000 in your browser.

## Project Status

Production build completed successfully.

## Developer

**Jeyanthi S**

GitHub: https://github.com/Jeyanthi1992