const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const { sendWelcomeEmail } = require("../utils/emailService");
const { protect } = require("../middleware/auth");

// =========================
// GENERATE JWT
// =========================
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// ==================================================
// REGISTER
// ==================================================
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role, company, phone, location } = req.body;

    // 🔹 Check existing user
    const userExists = await User.findByEmail(email);
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // 🔹 Create user
    const user = await User.create({
      name,
      email,
      password,
      role,
      company,
      phone,
      location,
    });

    // 🔹 Send welcome email (non-blocking)
    try {
      await sendWelcomeEmail(user);
    } catch (emailError) {
      console.error("Failed to send welcome email:", emailError);
    }

    const token = generateToken(user.id);

    res.status(201).json({
      _id: user.id, // keep frontend compatibility
      name: user.name,
      email: user.email,
      role: user.role,
      company: user.company,
      isApproved: user.isApproved,
      token,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==================================================
// LOGIN
// ==================================================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // 🔹 Fetch user WITH password
    const user = await User.findByEmail(email, true);

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await User.matchPassword(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = generateToken(user.id);

    res.json({
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      company: user.company,
      isApproved: user.isApproved,
      token,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==================================================
// GET CURRENT USER
// ==================================================
router.get("/me", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==================================================
// UPDATE PROFILE
// ==================================================
router.put("/profile", protect, async (req, res) => {
  try {
    const updates = {
      name: req.body.name,
      phone: req.body.phone,
      location: req.body.location,
      bio: req.body.bio,
      skills: req.body.skills,
      experience: req.body.experience,
      education: req.body.education,
    };

    // 🔹 Handle password change
    if (req.body.password) {
      updates.password = req.body.password;
    }

    const updatedUser = await User.update(req.user.id, updates);

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      _id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      phone: updatedUser.phone,
      location: updatedUser.location,
      bio: updatedUser.bio,
      skills: updatedUser.skills,
      experience: updatedUser.experience,
      education: updatedUser.education,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;