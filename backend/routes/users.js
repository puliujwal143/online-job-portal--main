const express = require("express");
const router = express.Router();

const User = require("../models/User");
const Job = require("../models/Job");
const Application = require("../models/Application");

const { protect, authorize } = require("../middleware/auth");

// ==================================================
// GET PENDING EMPLOYERS
// ==================================================
router.get(
  "/pending-employers",
  protect,
  authorize("admin"),
  async (req, res) => {
    try {
      const users = await User.getAll();

      const pendingEmployers = users
        .filter(
          (u) => u.role === "employer" && u.isApproved === false
        )
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      res.json(pendingEmployers);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// ==================================================
// GET ALL USERS (WITH PAGINATION + ROLE FILTER)
// ==================================================
router.get(
  "/all",
  protect,
  authorize("admin"),
  async (req, res) => {
    try {
      const { role, page = 1, limit = 10 } = req.query;

      let users = await User.getAll();

      if (role) {
        users = users.filter((u) => u.role === role);
      }

      users = users.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      const totalUsers = users.length;
      const totalPages = Math.ceil(totalUsers / limit);

      const start = (page - 1) * limit;
      const paginatedUsers = users.slice(
        start,
        start + Number(limit)
      );

      res.json({
        users: paginatedUsers,
        totalPages,
        currentPage: Number(page),
        totalUsers,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// ==================================================
// APPROVE EMPLOYER
// ==================================================
router.put(
  "/approve-employer/:id",
  protect,
  authorize("admin"),
  async (req, res) => {
    try {
      const user = await User.findById(req.params.id);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (user.role !== "employer") {
        return res
          .status(400)
          .json({ message: "User is not an employer" });
      }

      const updated = await User.update(req.params.id, {
        isApproved: true,
      });

      res.json({
        message: "Employer approved successfully",
        user: updated,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// ==================================================
// DELETE USER
// ==================================================
router.delete(
  "/:id",
  protect,
  authorize("admin"),
  async (req, res) => {
    try {
      const user = await User.findById(req.params.id);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (user.role === "admin") {
        return res
          .status(400)
          .json({ message: "Cannot delete admin user" });
      }

      await User.delete(req.params.id);

      res.json({ message: "User deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// ==================================================
// ADMIN DASHBOARD STATS
// ==================================================
router.get(
  "/stats",
  protect,
  authorize("admin"),
  async (req, res) => {
    try {
      const users = await User.getAll();
      const jobs = await Job.findAll();
      const applications = await Application.getAll();

      const stats = {
        users: {
          total: users.length,
          applicants: users.filter(u => u.role === "applicant").length,
          employers: users.filter(u => u.role === "employer").length,
          pendingEmployers: users.filter(
            u => u.role === "employer" && !u.isApproved
          ).length,
        },
        jobs: {
          total: jobs.length,
          open: jobs.filter(j => j.status === "open").length,
          pending: jobs.filter(j => j.status === "pending").length,
        },
        applications: {
          total: applications.length,
        },
      };

      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

module.exports = router;