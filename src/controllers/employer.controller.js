const employerService = require('../services/employer.service');

const createProfile = async (req, res, next) => {
  try {
    const employer = await employerService.createProfile(req.user.id, req.body);
    res.status(201).json({
      success: true,
      message: 'Employer profile created successfully',
      data: employer
    });
  } catch (error) {
    next(error);
  }
};

const getMyProfile = async (req, res, next) => {
  try {
    const employer = await employerService.getMyProfile(req.user.id);
    res.status(200).json({
      success: true,
      message: 'Employer profile retrieved successfully',
      data: employer
    });
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const employer = await employerService.updateProfile(req.user.id, req.body);
    res.status(200).json({
      success: true,
      message: 'Employer profile updated successfully',
      data: employer
    });
  } catch (error) {
    next(error);
  }
};

const getEmployerById = async (req, res, next) => {
  try {
    const employer = await employerService.getEmployerById(req.params.employerId);
    res.status(200).json({
      success: true,
      message: 'Employer details retrieved successfully',
      data: employer
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createProfile,
  getMyProfile,
  updateProfile,
  getEmployerById
};
