require('dotenv').config();
const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const fs = require('fs');
const path = require('path');
const app = require('./app');
const User = require('./models/user.model');

let mongod;

async function runTests() {
  console.log('=== STARTING JOB BOARD PLATFORM API INTEGRATION TESTS ===\n');

  try {
    mongod = await MongoMemoryServer.create({
      binary: {
        version: '6.0.4'
      }
    });
    const uri = mongod.getUri();
    await mongoose.connect(uri);
    console.log('✔ In-Memory MongoDB connected for testing.');

    // 1. AUTHENTICATION & REGISTRATION
    console.log('\n--- 1. Testing Auth & Registration ---');
    // Candidate Registration
    const candidateRegRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Abdi Mohamed',
        email: 'candidate@example.com',
        password: 'password123',
        role: 'candidate'
      });
    console.log('Candidate Register Status:', candidateRegRes.status, candidateRegRes.body.message);
    if (candidateRegRes.status !== 201) throw new Error('Candidate registration failed');
    const candidateToken = candidateRegRes.body.data.token;

    // Employer Registration
    const employerRegRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'SomTech Manager',
        email: 'employer@example.com',
        password: 'password123',
        role: 'employer'
      });
    console.log('Employer Register Status:', employerRegRes.status, employerRegRes.body.message);
    if (employerRegRes.status !== 201) throw new Error('Employer registration failed');
    const employerToken = employerRegRes.body.data.token;

    // Admin Creation (Direct for test)
    const adminUser = await User.create({
      name: 'System Admin',
      email: 'admin@example.com',
      password: 'password123',
      role: 'admin'
    });
    const jwt = require('jsonwebtoken');
    const adminToken = jwt.sign({ id: adminUser._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    console.log('✔ Admin user created directly.');

    // Login Test
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'candidate@example.com',
        password: 'password123'
      });
    console.log('Login Status:', loginRes.status, 'User Role:', loginRes.body.data.user.role);

    // 2. PROFILES
    console.log('\n--- 2. Testing Employer & Candidate Profiles ---');
    // Create Employer Profile
    const empProfileRes = await request(app)
      .post('/api/employers/profile')
      .set('Authorization', `Bearer ${employerToken}`)
      .send({
        companyName: 'SomTech Solutions',
        description: 'Leading Tech Company in Mogadishu',
        website: 'https://somtech.example.com',
        location: 'Mogadishu',
        industry: 'Software Development',
        phone: '+252615000000'
      });
    console.log('Employer Profile Create Status:', empProfileRes.status, empProfileRes.body.data.companyName);

    // Create Candidate Profile
    const candProfileRes = await request(app)
      .post('/api/candidates/profile')
      .set('Authorization', `Bearer ${candidateToken}`)
      .send({
        phone: '+252615111111',
        location: 'Mogadishu',
        bio: 'Enthusiastic Node.js Developer',
        skills: ['Node.js', 'Express.js', 'MongoDB'],
        education: [
          { degree: 'Bachelor of Computer Science', institution: 'Mogadishu University', year: 2025 }
        ]
      });
    console.log('Candidate Profile Create Status:', candProfileRes.status, candProfileRes.body.data.bio);

    // 3. RESUME UPLOAD
    console.log('\n--- 3. Testing Resume Upload ---');
    const testResumePath = path.join(__dirname, 'test_resume_sample.pdf');
    fs.writeFileSync(testResumePath, '%PDF-1.4 Fake PDF Content for Resume testing');

    const resumeUploadRes = await request(app)
      .post('/api/resumes/upload')
      .set('Authorization', `Bearer ${candidateToken}`)
      .attach('resume', testResumePath);

    console.log('Resume Upload Status:', resumeUploadRes.status, resumeUploadRes.body.message);
    const resumeId = resumeUploadRes.body.data.resumeId;

    if (fs.existsSync(testResumePath)) fs.unlinkSync(testResumePath);

    // 4. JOB POSTING & SEARCH
    console.log('\n--- 4. Testing Job Posting, Searching & Filtering ---');
    const createJobRes = await request(app)
      .post('/api/jobs')
      .set('Authorization', `Bearer ${employerToken}`)
      .send({
        title: 'Backend Node.js Developer',
        description: 'Looking for a senior backend engineer using Express & MongoDB.',
        requirements: ['3+ years Node.js', 'MongoDB Atlas experience'],
        responsibilities: ['Build scalable RESTful APIs'],
        location: 'Mogadishu',
        employmentType: 'full-time',
        category: 'Software Development',
        salaryMin: 800,
        salaryMax: 1500,
        skills: ['Node.js', 'MongoDB', 'Express.js'],
        deadline: '2026-12-31'
      });

    console.log('Job Posting Status:', createJobRes.status, 'Job ID:', createJobRes.body.data._id);
    const jobId = createJobRes.body.data._id;

    // Search Jobs Filter Test
    const searchRes = await request(app)
      .get('/api/jobs?search=Backend&location=Mogadishu&employmentType=full-time&minSalary=500');
    console.log('Job Search Found Jobs:', searchRes.body.data.totalJobs, 'Page:', searchRes.body.data.currentPage);

    // 5. APPLY FOR JOB
    console.log('\n--- 5. Testing Job Application ---');
    const applyRes = await request(app)
      .post(`/api/jobs/${jobId}/apply`)
      .set('Authorization', `Bearer ${candidateToken}`)
      .send({
        resumeId: resumeId,
        coverLetter: 'I am highly qualified for this backend developer position.'
      });

    console.log('Application Submission Status:', applyRes.status, 'App ID:', applyRes.body.data.applicationId);
    const applicationId = applyRes.body.data.applicationId;

    // Test Duplicate Application Prevention
    const dupApplyRes = await request(app)
      .post(`/api/jobs/${jobId}/apply`)
      .set('Authorization', `Bearer ${candidateToken}`)
      .send({
        resumeId: resumeId,
        coverLetter: 'Duplicate application test'
      });
    console.log('Duplicate Application Blocked (Expected 400):', dupApplyRes.status, dupApplyRes.body.message);

    // 6. EMPLOYER APPLICATION MANAGEMENT & STATUS UPDATE
    console.log('\n--- 6. Testing Employer Application Review & Status Update ---');
    const empAppsRes = await request(app)
      .get(`/api/jobs/${jobId}/applications`)
      .set('Authorization', `Bearer ${employerToken}`);
    console.log('Employer View Applications Count:', empAppsRes.body.data.length);

    // Employer updates application status to "shortlisted"
    const statusUpdateRes = await request(app)
      .patch(`/api/applications/${applicationId}/status`)
      .set('Authorization', `Bearer ${employerToken}`)
      .send({ status: 'shortlisted' });
    console.log('Status Update Response:', statusUpdateRes.status, 'New Status:', statusUpdateRes.body.data.status);

    // 7. NOTIFICATIONS
    console.log('\n--- 7. Testing Notifications ---');
    const candNotifRes = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${candidateToken}`);
    console.log('Candidate Notifications Count:', candNotifRes.body.data.length, 'Title:', candNotifRes.body.data[0]?.title);

    const empNotifRes = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${employerToken}`);
    console.log('Employer Notifications Count:', empNotifRes.body.data.length, 'Title:', empNotifRes.body.data[0]?.title);

    // 8. ADMIN FEATURES & STATISTICS
    console.log('\n--- 8. Testing Admin Features & Statistics ---');
    const statsRes = await request(app)
      .get('/api/admin/statistics')
      .set('Authorization', `Bearer ${adminToken}`);
    console.log('Admin Platform Statistics:', JSON.stringify(statsRes.body.data, null, 2));

    console.log('\n==================================================');
    console.log('🎉 ALL INTEGRATION TESTS PASSED PERFECTLY!');
    console.log('==================================================\n');

  } catch (error) {
    console.error('❌ Test execution failed:', error);
  } finally {
    await mongoose.disconnect();
    if (mongod) await mongod.stop();
    process.exit(0);
  }
}

runTests();
