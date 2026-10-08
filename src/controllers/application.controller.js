const applicationService = require('../services/application.service');

const applyForJob = async (req, res, next) => {
  try {
    const data = await applicationService.applyForJob(
      req.user.id,
      req.params.jobId,
      req.body
    );
    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data
    });
  } catch (error) {
    next(error);
  }
};

const getMyApplications = async (req, res, next) => {
  try {
    const applications = await applicationService.getMyApplications(req.user.id);
    res.status(200).json({
      success: true,
      message: 'Applications retrieved successfully',
      data: applications
    });
  } catch (error) {
    next(error);
  }
};

const getApplicationById = async (req, res, next) => {
  try {
    const application = await applicationService.getApplicationById(
      req.params.applicationId,
      req.user.id,
      req.user.role
    );
    res.status(200).json({
      success: true,
      message: 'Application retrieved successfully',
      data: application
    });
  } catch (error) {
    next(error);
  }
};

const withdrawApplication = async (req, res, next) => {
  try {
    const application = await applicationService.withdrawApplication(
      req.params.applicationId,
      req.user.id
    );
    res.status(200).json({
      success: true,
      message: 'Application withdrawn successfully',
      data: application
    });
  } catch (error) {
    next(error);
  }
};

const getApplicationsForJob = async (req, res, next) => {
  try {
    const applications = await applicationService.getApplicationsForJob(
      req.params.jobId,
      req.user.id,
      req.user.role
    );
    res.status(200).json({
      success: true,
      message: 'Job applications retrieved successfully',
      data: applications
    });
  } catch (error) {
    next(error);
  }
};

const updateApplicationStatus = async (req, res, next) => {
  try {
    const application = await applicationService.updateApplicationStatus(
      req.params.applicationId,
      req.user.id,
      req.user.role,
      req.body.status
    );
    res.status(200).json({
      success: true,
      message: 'Application status updated successfully',
      data: application
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  applyForJob,
  getMyApplications,
  getApplicationById,
  withdrawApplication,
  getApplicationsForJob,
  updateApplicationStatus
};
