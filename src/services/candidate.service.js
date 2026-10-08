const Candidate = require('../models/candidate.model');

class CandidateService {
  /**
   * Create candidate profile for authenticated candidate
   */
  async createProfile(userId, profileData) {
    const existing = await Candidate.findOne({ user: userId });
    if (existing) {
      const error = new Error('Candidate profile already exists for this account');
      error.statusCode = 400;
      throw error;
    }

    const candidate = await Candidate.create({
      user: userId,
      ...profileData
    });

    return candidate;
  }

  /**
   * Get candidate profile of authenticated candidate
   */
  async getMyProfile(userId) {
    const candidate = await Candidate.findOne({ user: userId }).populate('user', 'name email role');
    if (!candidate) {
      const error = new Error('Candidate profile not found. Please create one.');
      error.statusCode = 404;
      throw error;
    }
    return candidate;
  }

  /**
   * Update candidate profile of authenticated candidate
   */
  async updateProfile(userId, profileData) {
    const candidate = await Candidate.findOneAndUpdate(
      { user: userId },
      { $set: profileData },
      { new: true, runValidators: true }
    ).populate('user', 'name email role');

    if (!candidate) {
      const error = new Error('Candidate profile not found');
      error.statusCode = 404;
      throw error;
    }

    return candidate;
  }

  /**
   * Get candidate profile by ID
   */
  async getCandidateById(candidateId) {
    const candidate = await Candidate.findById(candidateId).populate('user', 'name email role');
    if (!candidate) {
      const error = new Error('Candidate not found');
      error.statusCode = 404;
      throw error;
    }
    return candidate;
  }
}

module.exports = new CandidateService();
