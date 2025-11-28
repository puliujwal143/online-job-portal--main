const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const { protect, authorize, checkApproval } = require('../middleware/auth');
const { sendJobApprovalNotification } = require('../utils/emailService');
const User = require('../models/User');

router.get('/', async (req, res) => {
  try {
    const {
      search,
      category,
      jobType,
      location,
      experienceLevel,
      minSalary,
      maxSalary,
      page = 1,
      limit = 10
    } = req.query;

    const query = { status: 'open' };

    if (search) {
      query.$text = { $search: search };
    }

    if (category) {
      query.category = category;
    }

    if (jobType) {
      query.jobType = jobType;
    }

    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    if (experienceLevel) {
      query.experienceLevel = experienceLevel;
    }

    if (minSalary) {
      query['salary.min'] = { $gte: parseInt(minSalary) };
    }

    if (maxSalary) {
      query['salary.max'] = { $lte: parseInt(maxSalary) };
    }

    const jobs = await Job.find(query)
      .populate('postedBy', 'name company')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Job.countDocuments(query);

    res.json({
      jobs,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalJobs: count
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/my-jobs', protect, authorize('employer'), async (req, res) => {
  try {
    const jobs = await Job.find({ postedBy: req.user._id })
      .sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/admin/pending', protect, authorize('admin'), async (req, res) => {
  try {
    const jobs = await Job.find({ status: 'pending' })
      .populate('postedBy', 'name company email')
      .sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('postedBy', 'name company email phone');
    
    if (job) {
      res.json(job);
    } else {
      res.status(404).json({ message: 'Job not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', protect, authorize('employer'), checkApproval, async (req, res) => {
  try {
    const {
      title,
      description,
      requirements,
      location,
      jobType,
      category,
      salary,
      experienceLevel,
      skills,
      applicationDeadline
    } = req.body;

    const job = await Job.create({
      title,
      company: req.user.company,
      description,
      requirements,
      location,
      jobType,
      category,
      salary,
      experienceLevel,
      skills,
      applicationDeadline,
      postedBy: req.user._id
    });

    res.status(201).json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id', protect, authorize('employer'), async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const updatedJob = await Job.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json(updatedJob);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:id', protect, authorize('employer', 'admin'), async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (req.user.role === 'employer' && job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await job.deleteOne();
    res.json({ message: 'Job removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id/approve', protect, authorize('admin'), async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate('postedBy');

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    job.status = 'open';
    await job.save();

    try {
      await sendJobApprovalNotification(job, job.postedBy);
    } catch (emailError) {
      console.error('Failed to send approval email:', emailError);
    }

    res.json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id/reject', protect, authorize('admin'), async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    job.status = 'closed';
    await job.save();

    res.json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;