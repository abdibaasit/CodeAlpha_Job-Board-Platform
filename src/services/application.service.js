const Application = require('../models/application.model');
const Job = require('../models/job.model');
const Candidate = require('../models/candidate.model');
const Resume = require('../models/resume.model');
const Employer = require('../models/employer.model');
const notificationService = require('./notification.service');

class ApplicationService {
  /**
   * Apply for a job listing
   */
  async applyForJob(userId, jobId, { resumeId, coverLetter }) {
    // Check candidate profile
    const candidate = await Candidate.findOne({ user: userId });
    if (!candidate) {
      const error = new Error('Candidate profile not found. Please create your profile before applying.');
      error.statusCode = 400;
      throw error;
    }

    // Check job existence & status
    const job = await Job.findById(jobId).populate('employer');
    if (!job) {
      const error = new Error('Job listing not found');
      error.statusCode = 404;
      throw error;
    }

    if (job.status !== 'open') {
      const error = new Error('This job listing is currently not open for applications.');
      error.statusCode = 400;
      throw error;
    }

    if (job.deadline && new Date(job.deadline) < new Date()) {
      const error = new Error('The application deadline for this job has passed.');
      error.statusCode = 400;
      throw error;
    }

    // Verify resume
    const resume = await Resume.findOne({ _id: resumeId, candidate: candidate._id });
    if (!resume) {
      const error = new Error('Invalid resume selected or resume does not belong to you.');
      error.statusCode = 400;
      throw error;
    }

    // Check existing active application
    const existingApp = await Application.findOne({
      candidate: candidate._id,
      job: jobId,
      status: { $ne: 'withdrawn' }
    });

    if (existingApp) {
      const error = new Error('You have already applied for this position.');
      error.statusCode = 400;
      throw error;
    }

    // Create application
    const application = await Application.create({
      candidate: candidate._id,
      job: jobId,
      resume: resumeId,
      coverLetter: coverLetter || '',
      status: 'applied',
      appliedAt: new Date()
    });

    // Notify Employer
    if (job.employer && job.employer.user) {
      await notificationService.createNotification({
        user: job.employer.user,
        type: 'new_application',
        title: 'New Job Application',
        message: `A candidate has applied for your "${job.title}" position.`,
        relatedJob: job._id,
        relatedApplication: application._id
      });
    }

    return {
      applicationId: application._id,
      status: application.status
    };
  }

  /**
   * Get applications for the logged-in candidate
   */
  async getMyApplications(userId) {
    const candidate = await Candidate.findOne({ user: userId });
    if (!candidate) {
      const error = new Error('Candidate profile not found');
      error.statusCode = 404;
      throw error;
    }

    const applications = await Application.find({ candidate: candidate._id })
      .populate({
        path: 'job',
        select: 'title location employmentType category salaryMin salaryMax status',
        populate: {
          path: 'employer',
          select: 'companyName location logo'
        }
      })
      .populate('resume', 'fileName filePath fileSize')
      .sort({ appliedAt: -1 });

    return applications;
  }

  /**
   * Get single application by ID
   */
  async getApplicationById(applicationId, userId, userRole) {
    const application = await Application.findById(applicationId)
      .populate({
        path: 'candidate',
        populate: { path: 'user', select: 'name email' }
      })
      .populate({
        path: 'job',
        populate: { path: 'employer' }
      })
      .populate('resume');

    if (!application) {
      const error = new Error('Application not found');
      error.statusCode = 404;
      throw error;
    }

    if (userRole === 'admin') {
      return application;
    }

    if (userRole === 'candidate') {
      const candidate = await Candidate.findOne({ user: userId });
      if (!candidate || application.candidate._id.toString() !== candidate._id.toString()) {
        const error = new Error('Unauthorized to view this application');
        error.statusCode = 403;
        throw error;
      }
      return application;
    }

    if (userRole === 'employer') {
      const employer = await Employer.findOne({ user: userId });
      if (!employer || application.job.employer._id.toString() !== employer._id.toString()) {
        const error = new Error('Unauthorized to view this application');
        error.statusCode = 403;
        throw error;
      }
      return application;
    }

    const error = new Error('Unauthorized access');
    error.statusCode = 403;
    throw error;
  }

  /**
   * Withdraw application (Candidate)
   */
  async withdrawApplication(applicationId, userId) {
    const candidate = await Candidate.findOne({ user: userId });
    if (!candidate) {
      const error = new Error('Candidate profile not found');
      error.statusCode = 404;
      throw error;
    }

    const application = await Application.findOne({ _id: applicationId, candidate: candidate._id });
    if (!application) {
      const error = new Error('Application not found');
      error.statusCode = 404;
      throw error;
    }

    if (!['applied', 'reviewing'].includes(application.status)) {
      const error = new Error(`Cannot withdraw application in status '${application.status}'`);
      error.statusCode = 400;
      throw error;
    }

    application.status = 'withdrawn';
    await application.save();

    return application;
  }

  /**
   * Get all applications for a specific job (Employer owner or Admin)
   */
  async getApplicationsForJob(jobId, userId, userRole) {
    const job = await Job.findById(jobId).populate('employer');
    if (!job) {
      const error = new Error('Job listing not found');
      error.statusCode = 404;
      throw error;
    }

    if (userRole !== 'admin') {
      const employer = await Employer.findOne({ user: userId });
      if (!employer || job.employer._id.toString() !== employer._id.toString()) {
        const error = new Error('Unauthorized. You can only view applications for your own jobs.');
        error.statusCode = 403;
        throw error;
      }
    }

    const applications = await Application.find({ job: jobId })
      .populate({
        path: 'candidate',
        populate: { path: 'user', select: 'name email' }
      })
      .populate('resume', 'fileName filePath fileSize fileType')
      .sort({ appliedAt: -1 });

    return applications;
  }

  /**
   * Update application status (Employer owner or Admin)
   */
  async updateApplicationStatus(applicationId, userId, userRole, newStatus) {
    const application = await Application.findById(applicationId)
      .populate({
        path: 'candidate',
        populate: { path: 'user', select: '_id name email' }
      })
      .populate({
        path: 'job',
        populate: { path: 'employer' }
      });

    if (!application) {
      const error = new Error('Application not found');
      error.statusCode = 404;
      throw error;
    }

    if (userRole !== 'admin') {
      const employer = await Employer.findOne({ user: userId });
      if (!employer || application.job.employer._id.toString() !== employer._id.toString()) {
        const error = new Error('Unauthorized to update this application status');
        error.statusCode = 403;
        throw error;
      }
    }

    application.status = newStatus;
    await application.save();

    // Create notification for Candidate
    if (application.candidate && application.candidate.user) {
      await notificationService.createNotification({
        user: application.candidate.user._id,
        type: 'application_status',
        title: 'Application Status Updated',
        message: `Your application status for "${application.job.title}" has been updated to "${newStatus}".`,
        relatedJob: application.job._id,
        relatedApplication: application._id
      });
    }

    return application;
  }
}

module.exports = new ApplicationService();
