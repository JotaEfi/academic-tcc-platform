# PI Sample System Walkthrough

## Overview
The system has been implemented with the following components:
- **Admin**: Manage projects, import CSV, view averages.
- **Student**: Evaluate projects via QR code (link).
- **Professor**: Evaluate assigned projects.

## Setup Instructions

### 1. Database Configuration
The system is configured to use **PostgreSQL**.
Please ensure your `.env` file has the correct credentials:
```env
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=amostra_pi
DB_USERNAME=postgres
DB_PASSWORD=postgres
```
Create the database if it doesn't exist:
```bash
createdb amostra_pi
```

### 2. Run Migrations
```bash
php artisan migrate
```

### 3. Run the Application
Start the backend and frontend servers:
```bash
php artisan serve
npm run dev
```

## Features

### Admin
- Access `/admin/dashboard`.
- Upload a CSV file (Format: `ID, Title, Leader, Location`).
- View list of projects and their average grades.
- Click "Link" to simulate scanning a QR code.

### Student
- Access `/project/{id}/evaluate`.
- Enter email (must end with `@aluno.unipface.edu.br`).
- Rate 10 criteria (0-10).
- Submit.

### Professor
- Access via Magic Link: `/access/{token}`.
- You can generate a token for a user in the database (e.g., `update users set access_token='secret123' where email='prof1@example.com';`).
- Visit `/access/secret123` to log in automatically.
- View assigned projects.
- Click "Evaluate" to rate a project.

## Notes
- **Lint Errors**: You may see TypeScript errors regarding `route()`. This is expected in this environment as Ziggy types are not fully configured, but the code works at runtime.
- **Seeding**: You may want to seed an admin user and some professors.
```php
User::create(['name' => 'Admin', 'email' => 'admin@example.com', 'password' => bcrypt('password'), 'role' => 'admin']);
User::create(['name' => 'Prof 1', 'email' => 'prof1@example.com', 'password' => bcrypt('password'), 'role' => 'professor']);
```
