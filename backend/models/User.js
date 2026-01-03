const { db } = require("../firebase");
const bcrypt = require("bcryptjs");

const USERS_COLLECTION = "users";

const User = {

  // =========================
  // CREATE USER (like .save)
  // =========================
  async create(userData) {
    // Hash password (replacement for pre('save'))
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);

const dataToSave = {
  name: userData.name,
  email: userData.email.toLowerCase(),
  password: hashedPassword,
  role: userData.role || "applicant",
  phone: userData.phone || "",
  location: userData.location || "",
  bio: "",
  skills: [],
  experience: "",
  education: "",
  resume: "",
  isApproved: userData.role === "applicant",
  createdAt: new Date(),
};

// ✅ ONLY add company if employer
if (userData.role === "employer") {
  dataToSave.company = userData.company;
}
    const ref = await db.collection(USERS_COLLECTION).add(dataToSave);

    return {
      id: ref.id,
      ...dataToSave,
      password: undefined // mimic select:false
    };
  },

  // =========================
  // FIND BY EMAIL
  // =========================
  async findByEmail(email, includePassword = false) {
    const snapshot = await db
      .collection(USERS_COLLECTION)
      .where("email", "==", email.toLowerCase())
      .limit(1)
      .get();

    if (snapshot.empty) return null;

    const doc = snapshot.docs[0];
    const data = doc.data();

    if (!includePassword) {
      delete data.password;
    }

    return {
      id: doc.id,
      ...data,
    };
  },

  // =========================
  // FIND BY ID
  // =========================
  async findById(id) {
    const doc = await db.collection(USERS_COLLECTION).doc(id).get();

    if (!doc.exists) return null;

    const data = doc.data();
    delete data.password;

    return {
      id: doc.id,
      ...data,
    };
  },

  // =========================
  // PASSWORD COMPARISON
  // =========================
  async matchPassword(enteredPassword, storedPassword) {
    return await bcrypt.compare(enteredPassword, storedPassword);
  },

  // =========================
  // UPDATE USER
  // =========================
  async update(id, updates) {
  // 🔥 Remove undefined values (CRITICAL for Firestore)
  Object.keys(updates).forEach(key => {
    if (updates[key] === undefined) {
      delete updates[key];
    }
  });

  await db.collection(USERS_COLLECTION).doc(id).update(updates);
  return this.findById(id);
},

  // =========================
  // GET ALL USERS
  // =========================
  async getAll() {
    const snapshot = await db.collection(USERS_COLLECTION).get();
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  },

   async delete(id) {
    await db.collection(USERS_COLLECTION).doc(id).delete();
    return true;
  }
};
module.exports = User;