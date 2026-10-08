const Employer = require('../models/employer.model');

class EmployerService {
  /**
   * Create employer profile for authenticated user
   */
  async createProfile(userId, profileData) {
    const existing = await Employer.findOne({ user: userId });
    if (existing) {
      const error = new Error('Employer profile already exists for this account');
      error.statusCode = 400;
      throw error;
    }

    const employer = await Employer.create({
      user: userId,
      ...profileData
    });

    return employer;
  }

  /**
   * Get employer profile of authenticated user
   */
  async getMyProfile(userId) {
    const employer = await Employer.findOne({ user: userId }).populate('user', 'name email role');
    if (!employer) {
      const error = new Error('Employer profile not found. Please create one.');
      error.statusCode = 404;
      throw error;
    }
    return employer;
  }

  /**
   * Update employer profile of authenticated user
   */
  async updateProfile(userId, profileData) {
    const employer = await Employer.findOneAndUpdate(
      { user: userId },
      { $set: profileData },
      { new: true, runValidators: true }
    ).populate('user', 'name email role');

    if (!employer) {
      const error = new Error('Employer profile not found');
      error.statusCode = 404;
      throw error;
    }

    return employer;
  }

  /**
   * Get employer profile by ID
   */
  async getEmployerById(employerId) {
    const employer = await Employer.findById(employerId).populate('user', 'name email role');
    if (!employer) {
      const error = new Error('Employer not found');
      error.statusCode = 404;
      throw error;
    }
    return employer;
  }
}

module.exports = new EmployerService();
