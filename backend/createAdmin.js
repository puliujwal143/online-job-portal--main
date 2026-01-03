require("dotenv").config();
const bcrypt = require("bcryptjs");
const { db } = require("./firebase");

const run = async () => {
  const email = "admin@gmail.com";
  const password = "admin123";

  const snap = await db
    .collection("users")
    .where("email", "==", email)
    .limit(1)
    .get();

  if (!snap.empty) {
    console.log("Admin already exists");
    process.exit(0);
  }

  const salt = await bcrypt.genSalt(10);
  const hashed = await bcrypt.hash(password, salt);

  await db.collection("users").add({
    name: "Admin",
    email,
    password: hashed,
    role: "admin",
    isApproved: true,
    createdAt: new Date(),
  });

  console.log("✅ Admin created successfully");
  process.exit(0);
};

run();