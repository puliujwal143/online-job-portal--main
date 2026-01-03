const express = require("express");
const router = express.Router();

const Job = require("../models/Job");
const User = require("../models/User");

const { protect, authorize, checkApproval } = require("../middleware/auth");
const { sendJobApprovalNotification } = require("../utils/emailService");

// ==================================================
// GET ALL JOBS (SEARCH + FILTER + PAGINATION)
// ==================================================
router.get("/", async (req, res) => {
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
      limit = 10,
    } = req.query;

    let jobs = await Job.findAll();

    // 🔹 Only open jobs
    jobs = jobs.filter((job) => job.status === "open");

    // 🔹 Search
    if (search) {
      const keyword = search.toLowerCase();
      jobs = jobs.filter((job) =>
        job.searchText?.includes(keyword)
      );
    }

    // 🔹 Filters
    if (category) {
      jobs = jobs.filter((job) => job.category === category);
    }

    if (jobType) {
      jobs = jobs.filter((job) => job.jobType === jobType);
    }

    if (location) {
      jobs = jobs.filter((job) =>
        job.location.toLowerCase().includes(location.toLowerCase())
      );
    }

    if (experienceLevel) {
      jobs = jobs.filter(
        (job) => job.experienceLevel === experienceLevel
      );
    }

    if (minSalary) {
      jobs = jobs.filter(
        (job) => job.salary?.min >= Number(minSalary)
      );
    }

    if (maxSalary) {
      jobs = jobs.filter(
        (job) => job.salary?.max <= Number(maxSalary)
      );
    }

    const totalJobs = jobs.length;
    const totalPages = Math.ceil(totalJobs / limit);

    // 🔹 Pagination
    const start = (page - 1) * limit;
    const paginatedJobs = jobs.slice(start, start + Number(limit));

    // 🔹 Populate postedBy
    const enriched = await Promise.all(
      paginatedJobs.map(async (job) => {
        const employer = await User.findById(job.postedBy);
        return {
          ...job,
          postedBy: employer
            ? { id: employer.id, name: employer.name, company: employer.company }
            : null,
        };
      })
    );

    res.json({
      jobs: enriched,
      totalPages,
      currentPage: Number(page),
      totalJobs,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==================================================
// GET MY JOBS (EMPLOYER)
// ==================================================
router.get(
  "/my-jobs",
  protect,
  authorize("employer"),
  async (req, res) => {
    try {
      const jobs = await Job.findAll();
      const myJobs = jobs.filter(
        (job) => job.postedBy === req.user.id
      );
      res.json(myJobs);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// ==================================================
// ADMIN – PENDING JOBS
// ==================================================
router.get(
  "/admin/pending",
  protect,
  authorize("admin"),
  async (req, res) => {
    try {
      const jobs = await Job.findAll();
      const pending = jobs.filter((job) => job.status === "pending");

      const enriched = await Promise.all(
        pending.map(async (job) => {
          const employer = await User.findById(job.postedBy);
          return {
            ...job,
            postedBy: employer,
          };
        })
      );

      res.json(enriched);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// ==================================================
// GET SINGLE JOB
// ==================================================
router.get("/:id", async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    const employer = await User.findById(job.postedBy);

    res.json({
      ...job,
      postedBy: employer,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==================================================
// CREATE JOB
// ==================================================
router.post(
  "/",
  protect,
  authorize("employer"),
  checkApproval,
  async (req, res) => {
    try {
      const job = await Job.create(req.body, req.user.id);
      res.status(201).json(job);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// ==================================================
// UPDATE JOB
// ==================================================
router.put(
  "/:id",
  protect,
  authorize("employer"),
  async (req, res) => {
    try {
      const job = await Job.findById(req.params.id);
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }

      if (job.postedBy !== req.user.id) {
        return res.status(403).json({ message: "Not authorized" });
      }

      const updated = await Job.update(req.params.id, req.body);
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// ==================================================
// DELETE JOB
// ==================================================
router.delete(
  "/:id",
  protect,
  authorize("employer", "admin"),
  async (req, res) => {
    try {
      const job = await Job.findById(req.params.id);
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }

      if (
        req.user.role === "employer" &&
        job.postedBy !== req.user.id
      ) {
        return res.status(403).json({ message: "Not authorized" });
      }

      await Job.delete(req.params.id);
      res.json({ message: "Job removed" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// ==================================================
// ADMIN – APPROVE JOB
// ==================================================
router.put(
  "/:id/approve",
  protect,
  authorize("admin"),
  async (req, res) => {
    try {
      const job = await Job.findById(req.params.id);
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }

      const updated = await Job.update(req.params.id, {
        status: "open",
      });

      const employer = await User.findById(updated.postedBy);

      try {
        await sendJobApprovalNotification(updated, employer);
      } catch (emailError) {
        console.error("Failed to send approval email:", emailError);
      }

      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// ==================================================
// ADMIN – REJECT JOB
// ==================================================
router.put(
  "/:id/reject",
  protect,
  authorize("admin"),
  async (req, res) => {
    try {
      const updated = await Job.update(req.params.id, {
        status: "closed",
      });

      if (!updated) {
        return res.status(404).json({ message: "Job not found" });
      }

      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

module.exports = router;