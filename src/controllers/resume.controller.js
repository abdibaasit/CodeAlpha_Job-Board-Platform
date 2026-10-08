const resumeService = require('../services/resume.service');

const uploadResume = async (req, res, next) => {
  try {
    const data = await resumeService.uploadResume(req.user.id, req.file);
    res.status(201).json({
      success: true,
      message: 'Resume uploaded successfully',
      data
    });
  } catch (error) {
    next(error);
  }
};

const getMyResumes = async (req, res, next) => {
  try {
    const data = await resumeService.getMyResumes(req.user.id);
    res.status(200).json({
      success: true,
      message: 'Resumes retrieved successfully',
      data
    });
  } catch (error) {
    next(error);
  }
};

const deleteResume = async (req, res, next) => {
  try {
    await resumeService.deleteResume(req.params.resumeId, req.user.id);
    res.status(200).json({
      success: true,
      message: 'Resume deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadResume,
  getMyResumes,
  deleteResume
};
