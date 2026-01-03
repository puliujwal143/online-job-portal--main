const multer = require("multer");
const path = require("path");
const { bucket } = require("../firebase");

// =========================
// USE BUILT-IN MEMORY STORAGE
// =========================
const storage = multer.memoryStorage();

// =========================
// FILE FILTER
// =========================
const fileFilter = (req, file, cb) => {
  const allowedTypes = /pdf|doc|docx/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF, DOC, and DOCX files are allowed!"));
  }
};

// =========================
// MULTER CONFIG
// =========================
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter,
});

// =========================
// UPLOAD TO FIREBASE STORAGE
// =========================
const uploadToFirebase = async (file) => {
  const uniqueName =
    "resume-" +
    Date.now() +
    "-" +
    Math.round(Math.random() * 1e9) +
    path.extname(file.originalname);

  const firebaseFile = bucket.file(`resumes/${uniqueName}`);

  const stream = firebaseFile.createWriteStream({
    metadata: {
      contentType: file.mimetype,
    },
  });

  return new Promise((resolve, reject) => {
    stream.on("error", reject);

    stream.on("finish", async () => {
      await firebaseFile.makePublic();
      resolve(firebaseFile.publicUrl());
    });

    stream.end(file.buffer);
  });
};

module.exports = { upload, uploadToFirebase };