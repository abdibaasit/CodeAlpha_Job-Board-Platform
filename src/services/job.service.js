const Job = require('../models/job.model');
const Employer = require('../models/employer.model');

class JobService {
  /**
   * Create a new job listing for employer
   */
  async createJob(userId, jobData) {
    const employer = await Employer.findOne({ user: userId });
    if (!employer) {
      const error = new Error('Employer profile not found. Please create an employer profile first.');
      error.statusCode = 400;
      throw error;
    }

    const job = await Job.create({
      employer: employer._id,
      ...jobData
    });

    return job;
  }

  /**
   * Get paginated jobs with search and filter parameters
   */
  async getJobs(queryParams) {
    const page = parseInt(queryParams.page, 10) || 1;
    const limit = parseInt(queryParams.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const query = {};

    // Filter by status (default to open unless explicitly specified)
    if (queryParams.status) {
      query.status = queryParams.status;
    } else {
      query.status = 'open';
    }

    // Text search filter
    if (queryParams.search) {
      const searchRegex = new RegExp(queryParams.search, 'i');
      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { category: searchRegex },
        { location: searchRegex },
        { skills: { $in: [searchRegex] } }
      ];
    }

    // Location filter
    if (queryParams.location) {
      query.location = new RegExp(queryParams.location, 'i');
    }

    // Category filter
    if (queryParams.category) {
      query.category = new RegExp(queryParams.category, 'i');
    }

    // Employment type filter
    if (queryParams.employmentType) {
      query.employmentType = queryParams.employmentType;
    }

    // Skills filter
    if (queryParams.skills) {
      const skillList = Array.isArray(queryParams.skills)
        ? queryParams.skills
        : queryParams.skills.split(',').map(s => s.trim());
      query.skills = { $in: skillList.map(s => new RegExp(s, 'i')) };
    }

    // Salary filters
    if (queryParams.minSalary || queryParams.maxSalary) {
      query.salaryMin = {};
      if (queryParams.minSalary) {
        query.salaryMin.$gte = Number(queryParams.minSalary);
      }
      if (queryParams.maxSalary) {
        query.salaryMin.$lte = Number(queryParams.maxSalary);
      }
    }

    const totalJobs = await Job.countDocuments(query);
    const totalPages = Math.ceil(totalJobs / limit);

    const jobs = await Job.find(query)
      .populate('employer', 'companyName location logo industry website')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return {
      jobs,
      currentPage: page,
      totalPages,
      totalJobs,
      limit
    };
  }

  /**
   * Get single job by ID
   */
  async getJobById(jobId) {
    const job = await Job.findById(jobId).populate(
      'employer',
      'companyName description location logo industry website phone'
    );

    if (!job) {
      const error = new Error('Job listing not found');
      error.statusCode = 404;
      throw error;
    }

    return job;
  }

  /**
   * Update job listing (Employer owner or Admin)
   */
  async updateJob(jobId, userId, userRole, updateData) {
    const job = await Job.findById(jobId);
    if (!job) {
      const error = new Error('Job listing not found');
      error.statusCode = 404;
      throw error;
    }

    if (userRole !== 'admin') {
      const employer = await Employer.findOne({ user: userId });
      if (!employer || job.employer.toString() !== employer._id.toString()) {
        const error = new Error('Unauthorized. You can only update jobs posted by your company.');
        error.statusCode = 403;
        throw error;
      }
    }

    Object.assign(job, updateData);
    await job.save();
    return job;
  }

  /**
   * Update job status (open/closed) or delete job
   */
  async updateJobStatus(jobId, userId, userRole, status) {
    const job = await Job.findById(jobId);
    if (!job) {
      const error = new Error('Job listing not found');
      error.statusCode = 404;
      throw error;
    }

    if (userRole !== 'admin') {
      const employer = await Employer.findOne({ user: userId });
      if (!employer || job.employer.toString() !== employer._id.toString()) {
        const error = new Error('Unauthorized. You can only change status for your company\'s jobs.');
        error.statusCode = 403;
        throw error;
      }
    }

    job.status = status;
    await job.save();
    return job;
  }

  /**
   * Delete job listing
   */
  async deleteJob(jobId, userId, userRole) {
    const job = await Job.findById(jobId);
    if (!job) {
      const error = new Error('Job listing not found');
      error.statusCode = 404;
      throw error;
    }

    if (userRole !== 'admin') {
      const employer = await Employer.findOne({ user: userId });
      if (!employer || job.employer.toString() !== employer._id.toString()) {
        const error = new Error('Unauthorized. You can only delete jobs posted by your company.');
        error.statusCode = 403;
        throw error;
      }
    }

    await job.deleteOne();
    return true;
  }
}

module.exports = new JobService();
