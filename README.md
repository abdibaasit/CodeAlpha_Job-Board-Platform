# Job Board Platform REST API

A clean, modular, and beginner-friendly backend REST API for a **Job Board Platform** built with Node.js, Express.js, MongoDB Atlas, and Mongoose.

---

## 1. Project Description

The **Job Board Platform** allows employers to create profiles, post jobs, manage applicants, and update application statuses. Candidates can create profiles, upload resumes in PDF/DOC/DOCX formats, search/filter open job listings, apply for positions, and track application progress. The platform features integrated real-time notifications for applicants and employers, as well as administrator management and analytics.

---

## 2. Main Features

- **Authentication & Authorization**: JWT token-based auth with password hashing via `bcryptjs` and role-based middleware (`candidate`, `employer`, `admin`).
- **Employer Profile Management**: Create, view, and update company profile information.
- **Candidate Profile Management**: Create and manage candidate profiles with education, experience, and skills.
- **Job Listing & Search**:
  - Employers can post, edit, close, or delete job listings.
  - Job seekers can search jobs with pagination and multi-criteria filters (`search`, `location`, `category`, `employmentType`, `minSalary`, `maxSalary`, `skills`).
- **Secure Resume Upload**: Multer middleware restricted to PDF, DOC, and DOCX extensions with file size validation.
- **Job Application Workflow**:
  - Candidates submit job applications with attached resumes and cover letters.
  - Prevents duplicate active applications.
  - Candidates can withdraw applications.
  - Employers can view applicants and update status (`applied`, `reviewing`, `shortlisted`, `interview`, `accepted`, `rejected`, `withdrawn`).
- **Notifications System**:
  - Automated notification to employers when a candidate applies.
  - Automated notification to candidates when application status changes.
  - Endpoint to view unread/read notifications and mark all as read.
- **Admin Management & Analytics**:
  - View all users, jobs, and applications.
  - Real-time platform statistics dashboard (`totalUsers`, `totalCandidates`, `totalEmployers`, `totalJobs`, `openJobs`, `totalApplications`, `applicationsByStatus`).

---

## 3. Technology Stack

- **Runtime Environment**: Node.js
- **Web Framework**: Express.js
- **Database**: MongoDB Atlas / Mongoose ORM
- **Authentication**: JSON Web Token (`jsonwebtoken`), `bcryptjs`
- **Request Validation**: `express-validator`
- **File Upload**: `multer`
- **Environment Management**: `dotenv`
- **Development Tooling**: `nodemon`, `supertest`

---

## 4. Architecture

The project strictly follows a Service-Oriented Backend Architecture:

```
Client / Postman
     │
     ▼
   Routes           (Defines HTTP endpoints & mounts middleware)
     │
     ▼
 Middleware         (Authentication, Role Checks, Validation, Uploads)
     │
     ▼
 Controllers        (Processes HTTP Request/Response, calls services)
     │
     ▼
  Services          (Contains pure Business Logic & Workflow validation)
     │
     ▼
   Models           (Defines Mongoose Schemas & MongoDB queries)
     │
     ▼
MongoDB Atlas
```

---

## 5. Project Structure

```
job-board-platform/
│
├── src/
│   ├── config/
│   │   └── database.js               # Database connection logic & fallback
│   │
│   ├── controllers/
│   │   ├── admin.controller.js       # Admin HTTP handlers
│   │   ├── application.controller.js # Application HTTP handlers
│   │   ├── auth.controller.js        # Auth HTTP handlers
│   │   ├── candidate.controller.js   # Candidate HTTP handlers
│   │   ├── employer.controller.js    # Employer HTTP handlers
│   │   ├── job.controller.js         # Job HTTP handlers
│   │   ├── notification.controller.js# Notification HTTP handlers
│   │   └── resume.controller.js      # Resume HTTP handlers
│   │
│   ├── middleware/
│   │   ├── auth.middleware.js       # JWT Verification
│   │   ├── error.middleware.js      # Centralized Error Handling
│   │   ├── role.middleware.js       # Role authorization
│   │   ├── upload.middleware.js     # Multer file filter & storage
│   │   └── validation.middleware.js # Express-validator result parser
│   │
│   ├── models/
│   │   ├── application.model.js     # Application schema
│   │   ├── candidate.model.js       # Candidate schema
│   │   ├── employer.model.js        # Employer schema
│   │   ├── job.model.js             # Job schema & text index
│   │   ├── notification.model.js    # Notification schema
│   │   ├── resume.model.js          # Resume schema
│   │   └── user.model.js            # User schema & password hashing
│   │
│   ├── routes/
│   │   ├── admin.routes.js          # /api/admin endpoints
│   │   ├── application.routes.js    # /api/applications endpoints
│   │   ├── auth.routes.js           # /api/auth endpoints
│   │   ├── candidate.routes.js      # /api/candidates endpoints
│   │   ├── employer.routes.js       # /api/employers endpoints
│   │   ├── job.routes.js            # /api/jobs endpoints
│   │   ├── notification.routes.js   # /api/notifications endpoints
│   │   └── resume.routes.js         # /api/resumes endpoints
│   │
│   ├── services/
│   │   ├── admin.service.js         # Admin logic & analytics calculation
│   │   ├── application.service.js   # Application & status workflow logic
│   │   ├── auth.service.js          # User registration & login logic
│   │   ├── candidate.service.js     # Candidate profile logic
│   │   ├── employer.service.js      # Employer profile logic
│   │   ├── job.service.js           # Job CRUD & query builder logic
│   │   ├── notification.service.js   # Notification creation & query logic
│   │   └── resume.service.js        # Resume upload & disk file handling logic
│   │
│   ├── validators/
│   │   ├── application.validator.js # Application input rules
│   │   ├── auth.validator.js        # Auth input rules
│   │   ├── candidate.validator.js   # Candidate input rules
│   │   ├── employer.validator.js    # Employer input rules
│   │   └── job.validator.js         # Job input rules
│   │
│   ├── uploads/
│   │   └── resumes/                 # Local resume storage directory
│   │
│   ├── app.js                       # Express app configuration
│   └── server.js                    # Server startup script
│
├── .env
├── .env.example
├── .gitignore
├── package.json
├── README.md
└── postman/
    └── job-board-api.json           # Complete Postman Collection
```

---

## 6. Database Design

- **users**: Stores authentication credentials (`name`, `email`, `password`, `role`).
- **employers**: References `User` (`user`, `companyName`, `description`, `website`, `location`, `industry`).
- **candidates**: References `User` (`user`, `phone`, `location`, `bio`, `skills`, `education`, `experience`).
- **jobs**: References `Employer` (`employer`, `title`, `description`, `requirements`, `location`, `employmentType`, `category`, `salaryMin`, `salaryMax`, `skills`, `deadline`, `status`).
- **resumes**: References `Candidate` (`candidate`, `fileName`, `filePath`, `fileType`, `fileSize`, `uploadedAt`).
- **applications**: References `Candidate`, `Job`, `Resume` (`candidate`, `job`, `resume`, `coverLetter`, `status`, `appliedAt`).
- **notifications**: References `User` (`user`, `type`, `title`, `message`, `relatedJob`, `relatedApplication`, `isRead`).

---

## 7. API Endpoints Summary

### Auth Routes (`/api/auth`)
- `POST /api/auth/register` - Register a new candidate or employer
- `POST /api/auth/login` - Login user and obtain JWT token

### Employer Routes (`/api/employers`)
- `POST /api/employers/profile` - Create employer profile
- `GET /api/employers/profile` - Get authenticated employer profile
- `PUT /api/employers/profile` - Update employer profile
- `GET /api/employers/:employerId` - Get employer details by ID

### Candidate Routes (`/api/candidates`)
- `POST /api/candidates/profile` - Create candidate profile
- `GET /api/candidates/profile` - Get authenticated candidate profile
- `PUT /api/candidates/profile` - Update candidate profile
- `GET /api/candidates/:candidateId` - Get candidate details by ID

### Job Routes (`/api/jobs`)
- `GET /api/jobs` - Search and filter job listings (with pagination)
- `GET /api/jobs/:jobId` - Get job details
- `POST /api/jobs` - Post a new job (Employers only)
- `PUT /api/jobs/:jobId` - Edit job listing (Owner/Admin)
- `PATCH /api/jobs/:jobId/status` - Change job status `open`/`closed` (Owner/Admin)
- `DELETE /api/jobs/:jobId` - Delete job listing (Owner/Admin)
- `POST /api/jobs/:jobId/apply` - Submit job application (Candidates only)
- `GET /api/jobs/:jobId/applications` - View applications for job (Employer owner/Admin)

### Resume Routes (`/api/resumes`)
- `POST /api/resumes/upload` - Upload PDF/DOC/DOCX resume
- `GET /api/resumes/my` - Get candidate's uploaded resumes
- `DELETE /api/resumes/:resumeId` - Delete uploaded resume

### Application Routes (`/api/applications`)
- `GET /api/applications/my` - Track candidate applications
- `GET /api/applications/:applicationId` - Get application details
- `PATCH /api/applications/:applicationId/withdraw` - Withdraw job application
- `PATCH /api/applications/:applicationId/status` - Update applicant status (Employer owner/Admin)

### Notification Routes (`/api/notifications`)
- `GET /api/notifications` - Get user notifications
- `PATCH /api/notifications/:notificationId/read` - Mark single notification read
- `PATCH /api/notifications/read-all` - Mark all notifications read

### Admin Routes (`/api/admin`)
- `GET /api/admin/users` - View all registered users
- `GET /api/admin/jobs` - View all job listings
- `GET /api/admin/applications` - View all applications
- `GET /api/admin/statistics` - View platform analytics dashboard

---

## 8. Environment Setup & Installation

1. **Clone or navigate to project directory**:
   ```bash
   cd job-board-platform
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables (`.env`)**:
   Create a `.env` file based on `.env.example`:
   ```env
   PORT=4000
   MONGODB_URI=mongodb://127.0.0.1:27017/job_board_db
   JWT_SECRET=super_secret_jwt_key_job_board_2026
   JWT_EXPIRES_IN=7d
   MAX_FILE_SIZE=5242880
   ```

4. **Start Application**:
   - For production:
     ```bash
     npm start
     ```
   - For development (with live reload):
     ```bash
     npm run dev
     ```

---

## 9. Example Request & Response

### Register Candidate Request
`POST http://localhost:4000/api/auth/register`

```json
{
  "name": "Abdi Mohamed",
  "email": "abdi@example.com",
  "password": "password123",
  "role": "candidate"
}
```

### Response (201 Created)
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "6602abc1234567890abcdef1",
      "name": "Abdi Mohamed",
      "email": "abdi@example.com",
      "role": "candidate"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

## 10. Postman Testing

A pre-configured Postman Collection is provided in `postman/job-board-api.json`.

To test:
1. Open Postman -> Import -> Select `postman/job-board-api.json`.
2. Register/Login as Employer or Candidate to obtain the `token`.
3. Set the `Bearer {{token}}` in header for protected requests.
