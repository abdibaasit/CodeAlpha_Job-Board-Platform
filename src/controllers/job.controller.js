const jobService = require('../services/job.service');

const createJob = async (req, res, next) => {
  try {
    const job = await jobService.createJob(req.user.id, req.body);
    res.status(201).json({
      success: true,
      message: 'Job listing created successfully',
      data: job
    });
  } catch (error) {
    next(error);
  }
};

const getJobs = async (req, res, next) => {
  try {
    const result = await jobService.getJobs(req.query);
    res.status(200).json({
      success: true,
      message: 'Jobs retrieved successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

const getJobById = async (req, res, next) => {
  try {
    const job = await jobService.getJobById(req.params.jobId);
    res.status(200).json({
      success: true,
      message: 'Job details retrieved successfully',
      data: job
    });
  } catch (error) {
    next(error);
  }
};

const updateJob = async (req, res, next) => {
  try {
    const job = await jobService.updateJob(
      req.params.jobId,
      req.user.id,
      req.user.role,
      req.body
    );
    res.status(200).json({
      success: true,
      message: 'Job listing updated successfully',
      data: job
    });
  } catch (error) {
    next(error);
  }
};

const updateJobStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['open', 'closed', 'draft'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid job status'
      });
    }
    const job = await jobService.updateJobStatus(
      req.params.jobId,
      req.user.id,
      req.user.role,
      status
    );
    res.status(200).json({
      success: true,
      message: `Job status updated to '${status}' successfully`,
      data: job
    });
  } catch (error) {
    next(error);
  }
};

const deleteJob = async (req, res, next) => {
  try {
    await jobService.deleteJob(req.params.jobId, req.user.id, req.user.role);
    res.status(200).json({
      success: true,
      message: 'Job listing deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createJob,
  getJobs,
  getJobById,
  updateJob,
  updateJobStatus,
  deleteJob
};
