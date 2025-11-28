const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a job title'],
    trim: true
  },
  company: {
    type: String,
    required: [true, 'Please provide company name']
  },
  description: {
    type: String,
    required: [true, 'Please provide job description']
  },
  requirements: {
    type: String,
    required: [true, 'Please provide job requirements']
  },
  location: {
    type: String,
    required: [true, 'Please provide location']
  },
  jobType: {
    type: String,
    enum: ['Full-time', 'Part-time', 'Contract', 'Internship', 'Remote'],
    required: [true, 'Please select job type']
  },
  category: {
    type: String,
    required: [true, 'Please provide job category'],
    enum: ['IT', 'Marketing', 'Sales', 'Finance', 'HR', 'Design', 'Engineering', 'Healthcare', 'Education', 'Other']
  },
  salary: {
    min: {
      type: Number,
      required: [true, 'Please provide minimum salary']
    },
    max: {
      type: Number,
      required: [true, 'Please provide maximum salary']
    },
    currency: {
      type: String,
      default: 'USD'
    }
  },
  experienceLevel: {
    type: String,
    enum: ['Entry Level', 'Mid Level', 'Senior Level', 'Executive'],
    required: [true, 'Please select experience level']
  },
  skills: [{
    type: String
  }],
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['open', 'closed', 'pending'],
    default: 'pending'
  },
  applicationDeadline: {
    type: Date,
    required: [true, 'Please provide application deadline']
  },
  applicationsCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

jobSchema.index({ title: 'text', description: 'text', company: 'text' });

module.exports = mongoose.model('Job', jobSchema);