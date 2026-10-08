const Resume = require('../models/resume.model');
const Candidate = require('../models/candidate.model');
const fs = require('fs');
const path = require('path');

class ResumeService {
  /**
   * Create and record a new resume upload
   */
  async uploadResume(userId, file) {
    if (!file) {
      const error = new Error('No resume file was uploaded.');
      error.statusCode = 400;
      throw error;
    }

    const candidate = await Candidate.findOne({ user: userId });
    if (!candidate) {
      // Clean up uploaded file if candidate profile doesn't exist
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      const error = new Error('Candidate profile not found. Please create a candidate profile before uploading a resume.');
      error.statusCode = 400;
      throw error;
    }

    const relativePath = path.relative(path.join(__dirname, '../..'), file.path);

    const resume = await Resume.create({
      candidate: candidate._id,
      fileName: file.originalname,
      filePath: relativePath,
      fileType: file.mimetype,
      fileSize: file.size,
      uploadedAt: new Date()
    });

    return {
      resumeId: resume._id,
      fileName: resume.fileName,
      filePath: resume.filePath,
      fileType: resume.fileType,
      fileSize: resume.fileSize,
      uploadedAt: resume.uploadedAt
    };
  }

  /**
   * Get all resumes of authenticated candidate
   */
  async getMyResumes(userId) {
    const candidate = await Candidate.findOne({ user: userId });
    if (!candidate) {
      const error = new Error('Candidate profile not found');
      error.statusCode = 404;
      throw error;
    }

    const resumes = await Resume.find({ candidate: candidate._id }).sort({ uploadedAt: -1 });
    return resumes;
  }

  /**
   * Delete resume by ID
   */
  async deleteResume(resumeId, userId) {
    const candidate = await Candidate.findOne({ user: userId });
    if (!candidate) {
      const error = new Error('Candidate profile not found');
      error.statusCode = 404;
      throw error;
    }

    const resume = await Resume.findOne({ _id: resumeId, candidate: candidate._id });
    if (!resume) {
      const error = new Error('Resume not found or does not belong to you');
      error.statusCode = 404;
      throw error;
    }

    // Delete file from disk if it exists
    const absolutePath = path.join(__dirname, '../../', resume.filePath);
    if (fs.existsSync(absolutePath)) {
      try {
        fs.unlinkSync(absolutePath);
      } catch (err) {
        console.warn(`Could not delete file from disk: ${err.message}`);
      }
    }

    await resume.deleteOne();
    return true;
  }
}

module.exports = new ResumeService();
