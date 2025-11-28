const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');
const { protect, authorize } = require('../middleware/auth');

router.get('/pending-employers', protect, authorize('admin'), async (req, res) => {
  try {
    const employers = await User.find({ role: 'employer', isApproved: false })
      .select('-password')
      .sort({ createdAt: -1 });
    res.json(employers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/all', protect, authorize('admin'), async (req, res) => {
  try {
    const { role, page = 1, limit = 10 } = req.query;
    
    const query = role ? { role } : {};
    
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await User.countDocuments(query);

    res.json({
      users,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalUsers: count
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/approve-employer/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role !== 'employer') {
      return res.status(400).json({ message: 'User is not an employer' });
    }

    user.isApproved = true;
    await user.save();

    res.json({ message: 'Employer approved successfully', user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Cannot delete admin user' });
    }

    await user.deleteOne();
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/stats', protect, authorize('admin'), async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalApplicants = await User.countDocuments({ role: 'applicant' });
    const totalEmployers = await User.countDocuments({ role: 'employer' });
    const pendingEmployers = await User.countDocuments({ role: 'employer', isApproved: false });
    const totalJobs = await Job.countDocuments();
    const openJobs = await Job.countDocuments({ status: 'open' });
    const pendingJobs = await Job.countDocuments({ status: 'pending' });
    const totalApplications = await Application.countDocuments();

    res.json({
      users: {
        total: totalUsers,
        applicants: totalApplicants,
        employers: totalEmployers,
        pendingEmployers
      },
      jobs: {
        total: totalJobs,
        open: openJobs,
        pending: pendingJobs
      },
      applications: {
        total: totalApplications
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;