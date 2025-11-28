const express = require('express');
const router = express.Router();
const Application = require('../models/Application');
const Job = require('../models/Job');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { sendApplicationConfirmation, sendApplicationStatusUpdate } = require('../utils/emailService');

router.post('/', protect, authorize('applicant'), upload.single('resume'), async (req, res) => {
  try {
    const { jobId, coverLetter } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a resume' });
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.status !== 'open') {
      return res.status(400).json({ message: 'This job is no longer accepting applications' });
    }

    const existingApplication = await Application.findOne({
      job: jobId,
      applicant: req.user._id
    });

    if (existingApplication) {
      return res.status(400).json({ message: 'You have already applied for this job' });
    }

    const application = await Application.create({
      job: jobId,
      applicant: req.user._id,
      resume: req.file.path,
      coverLetter
    });

    job.applicationsCount += 1;
    await job.save();

    const populatedApplication = await Application.findById(application._id)
      .populate('job')
      .populate('applicant');

    try {
      await sendApplicationConfirmation(application, job, req.user);
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
    }

    res.status(201).json(populatedApplication);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/my-applications', protect, authorize('applicant'), async (req, res) => {
  try {
    const applications = await Application.find({ applicant: req.user._id })
      .populate('job')
      .sort({ appliedAt: -1 });
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/job/:jobId', protect, authorize('employer'), async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const applications = await Application.find({ job: req.params.jobId })
      .populate('applicant', 'name email phone location skills experience education')
      .sort({ appliedAt: -1 });

    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', protect, async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('job')
      .populate('applicant', 'name email phone location skills experience education');

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    if (req.user.role === 'applicant' && application.applicant._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (req.user.role === 'employer') {
      const job = await Job.findById(application.job._id);
      if (job.postedBy.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized' });
      }
    }

    res.json(application);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id/status', protect, authorize('employer', 'admin'), async (req, res) => {
  try {
    const { status, notes } = req.body;

    const application = await Application.findById(req.params.id)
      .populate('job')
      .populate('applicant');

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    if (req.user.role === 'employer') {
      const job = await Job.findById(application.job._id);
      if (job.postedBy.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized' });
      }
    }

    application.status = status;
    application.notes = notes;
    application.reviewedAt = Date.now();

    await application.save();

    try {
      await sendApplicationStatusUpdate(application, application.job, application.applicant);
    } catch (emailError) {
      console.error('Failed to send status update email:', emailError);
    }

    res.json(application);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/stats/overview', protect, authorize('admin'), async (req, res) => {
  try {
    const totalApplications = await Application.countDocuments();
    const pendingApplications = await Application.countDocuments({ status: 'pending' });
    const acceptedApplications = await Application.countDocuments({ status: 'accepted' });
    const rejectedApplications = await Application.countDocuments({ status: 'rejected' });

    res.json({
      total: totalApplications,
      pending: pendingApplications,
      accepted: acceptedApplications,
      rejected: rejectedApplications
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;