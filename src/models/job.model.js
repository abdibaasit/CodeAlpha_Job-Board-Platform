const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    employer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employer',
      required: true
    },
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Job description is required']
    },
    requirements: {
      type: [String],
      default: []
    },
    responsibilities: {
      type: [String],
      default: []
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true
    },
    employmentType: {
      type: String,
      enum: ['full-time', 'part-time', 'contract', 'internship', 'remote'],
      required: [true, 'Employment type is required']
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true
    },
    salaryMin: {
      type: Number,
      min: [0, 'Minimum salary cannot be negative']
    },
    salaryMax: {
      type: Number,
      min: [0, 'Maximum salary cannot be negative']
    },
    skills: {
      type: [String],
      default: []
    },
    deadline: {
      type: Date
    },
    status: {
      type: String,
      enum: ['open', 'closed', 'draft'],
      default: 'open'
    }
  },
  {
    timestamps: true
  }
);

// Compound text index for job search
jobSchema.index({
  title: 'text',
  description: 'text',
  skills: 'text',
  category: 'text',
  location: 'text'
});

module.exports = mongoose.model('Job', jobSchema);
