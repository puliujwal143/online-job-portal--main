const express = require("express");
const router = express.Router();

const Application = require("../models/Application");
const Job = require("../models/Job");
const { upload, uploadToFirebase } = require("../middleware/upload");
const User = require("../models/User");

const { protect, authorize } = require("../middleware/auth");

const {
  sendApplicationConfirmation,
  sendApplicationStatusUpdate,
} = require("../utils/emailService");

/* ==================================================
   APPLY FOR A JOB
================================================== */
router.post(
  "/",
  protect,
  authorize("applicant"),
  upload.single("resume"),
  async (req, res) => {
    try {
      const { jobId, coverLetter } = req.body;

      if (!req.file) {
        return res.status(400).json({ message: "Please upload a resume" });
      }

      const job = await Job.findById(jobId);
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }

      if (job.status !== "open") {
        return res
          .status(400)
          .json({ message: "This job is no longer accepting applications" });
      }

      // ✅ Upload to Firebase Storage
      const resumeUrl = await uploadToFirebase(req.file);

      const application = await Application.create({
        jobId,
        applicantId: req.user.id,
        resume: resumeUrl,
        coverLetter: coverLetter || "",
      });

      await Job.incrementApplications(jobId);

      res.status(201).json(application);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: error.message });
    }
  }
);
/* ==================================================
   GET MY APPLICATIONS (APPLICANT)
================================================== */
router.get(
  "/my-applications",
  protect,
  authorize("applicant"),
  async (req, res) => {
    try {
      const applications = await Application.findByApplicant(req.user.id);

      const enriched = await Promise.all(
        applications.map(async (app) => {
          const job = await Job.findById(app.job);
          if (!job) return null; // ✅ prevent crashes
          return { ...app, job };
        })
      );

      res.json(enriched.filter(Boolean)); // ✅ remove nulls
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

/* ==================================================
   GET APPLICATIONS FOR A JOB (EMPLOYER)
================================================== */
router.get(
  "/job/:jobId",
  protect,
  authorize("employer"),
  async (req, res) => {
    try {
      const job = await Job.findById(req.params.jobId);
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }

      if (String(job.postedBy) !== String(req.user.id)) {
        return res.status(403).json({ message: "Not authorized" });
      }

      const applications = await Application.findByJob(req.params.jobId);

      const enriched = await Promise.all(
        applications.map(async (app) => {
          const applicant = await User.findById(app.applicant);
          return { ...app, applicant };
        })
      );

      res.json(enriched);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

/* ==================================================
   GET SINGLE APPLICATION
================================================== */
router.get("/:id", protect, async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    const job = await Job.findById(application.job);
    const applicant = await User.findById(application.applicant);

    if (!job || !applicant) {
      return res.status(404).json({ message: "Related data missing" });
    }

    if (
      req.user.role === "applicant" &&
      applicant.id !== req.user.id
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (
      req.user.role === "employer" &&
      String(job.postedBy) !== String(req.user.id)
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    res.json({ ...application, job, applicant });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* ==================================================
   UPDATE APPLICATION STATUS
================================================== */
router.put(
  "/:id/status",
  protect,
  authorize("employer", "admin"),
  async (req, res) => {
    try {
      const { status, notes } = req.body;

      const application = await Application.findById(req.params.id);
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }

      const job = await Job.findById(application.job);
      const applicant = await User.findById(application.applicant);

      if (
        req.user.role === "employer" &&
        String(job.postedBy) !== String(req.user.id)
      ) {
        return res.status(403).json({ message: "Not authorized" });
      }

      const updated = await Application.updateStatus(
        req.params.id,
        status,
        notes || ""
      );

      try {
        await sendApplicationStatusUpdate(updated, job, applicant);
      } catch (e) {
        console.error("Email error:", e.message);
      }

      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

/* ==================================================
   ADMIN STATS
================================================== */
router.get(
  "/stats/overview",
  protect,
  authorize("admin"),
  async (req, res) => {
    try {
      const all = await Application.getAll();

      res.json({
        total: all.length,
        pending: all.filter(a => a.status === "pending").length,
        accepted: all.filter(a => a.status === "accepted").length,
        rejected: all.filter(a => a.status === "rejected").length,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

module.exports = router;