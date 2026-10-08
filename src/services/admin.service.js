const User = require('../models/user.model');
const Candidate = require('../models/candidate.model');
const Employer = require('../models/employer.model');
const Job = require('../models/job.model');
const Application = require('../models/application.model');

class AdminService {
  /**
   * Get all users in the system
   */
  async getAllUsers() {
    return await User.find().select('-password').sort({ createdAt: -1 });
  }

  /**
   * Get all job listings
   */
  async getAllJobs() {
    return await Job.find()
      .populate('employer', 'companyName location industry')
      .sort({ createdAt: -1 });
  }

  /**
   * Get all job applications across the platform
   */
  async getAllApplications() {
    return await Application.find()
      .populate({
        path: 'candidate',
        populate: { path: 'user', select: 'name email' }
      })
      .populate({
        path: 'job',
        select: 'title companyName',
        populate: { path: 'employer', select: 'companyName' }
      })
      .populate('resume', 'fileName')
      .sort({ appliedAt: -1 });
  }

  /**
   * Calculate comprehensive platform statistics
   */
  async getStatistics() {
    const totalUsers = await User.countDocuments();
    const totalCandidates = await Candidate.countDocuments();
    const totalEmployers = await Employer.countDocuments();

    const totalJobs = await Job.countDocuments();
    const openJobs = await Job.countDocuments({ status: 'open' });
    const closedJobs = await Job.countDocuments({ status: 'closed' });

    const totalApplications = await Application.countDocuments();

    const statuses = ['applied', 'reviewing', 'shortlisted', 'interview', 'accepted', 'rejected', 'withdrawn'];
    const applicationsByStatus = {};

    for (const status of statuses) {
      applicationsByStatus[status] = await Application.countDocuments({ status });
    }

    return {
      totalUsers,
      totalCandidates,
      totalEmployers,
      totalJobs,
      openJobs,
      closedJobs,
      totalApplications,
      applicationsByStatus
    };
  }
}

module.exports = new AdminService();
