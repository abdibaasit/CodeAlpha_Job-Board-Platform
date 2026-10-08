const candidateService = require('../services/candidate.service');

const createProfile = async (req, res, next) => {
  try {
    const candidate = await candidateService.createProfile(req.user.id, req.body);
    res.status(201).json({
      success: true,
      message: 'Candidate profile created successfully',
      data: candidate
    });
  } catch (error) {
    next(error);
  }
};

const getMyProfile = async (req, res, next) => {
  try {
    const candidate = await candidateService.getMyProfile(req.user.id);
    res.status(200).json({
      success: true,
      message: 'Candidate profile retrieved successfully',
      data: candidate
    });
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const candidate = await candidateService.updateProfile(req.user.id, req.body);
    res.status(200).json({
      success: true,
      message: 'Candidate profile updated successfully',
      data: candidate
    });
  } catch (error) {
    next(error);
  }
};

const getCandidateById = async (req, res, next) => {
  try {
    const candidate = await candidateService.getCandidateById(req.params.candidateId);
    res.status(200).json({
      success: true,
      message: 'Candidate details retrieved successfully',
      data: candidate
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createProfile,
  getMyProfile,
  updateProfile,
  getCandidateById
};
