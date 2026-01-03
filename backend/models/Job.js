const { db } = require("../firebase");

const JOBS_COLLECTION = "jobs";

const Job = {

async create(jobData, userId) {
  // 🔹 Fetch employer from Firestore
  const employerDoc = await db.collection("users").doc(userId).get();

  if (!employerDoc.exists) {
    throw new Error("Employer not found");
  }

  const employer = employerDoc.data();

  const dataToSave = {
    title: jobData.title?.trim(),
    company: employer.company, // ✅ FIXED
    description: jobData.description,
    requirements: jobData.requirements,
    location: jobData.location,
    jobType: jobData.jobType,
    category: jobData.category,

    salary: {
      min: Number(jobData.salary?.min),
      max: Number(jobData.salary?.max),
      currency: jobData.salary?.currency || "USD",
    },

    experienceLevel: jobData.experienceLevel,
    skills: jobData.skills || [],
    postedBy: userId,
    status: "pending",
    applicationDeadline: jobData.applicationDeadline
  ? new Date(jobData.applicationDeadline)
  : null,
    applicationsCount: 0,
    createdAt: new Date(),

    // 🔍 Search helper
    searchText: [
      jobData.title,
      employer.company,
      jobData.description,
    ]
      .join(" ")
      .toLowerCase(),
  };

  const ref = await db.collection("jobs").add(dataToSave);

  return {
    id: ref.id,
    ...dataToSave,
  };
},

  // =========================
  // GET ALL JOBS
  // =========================
  async findAll() {
    const snapshot = await db
      .collection(JOBS_COLLECTION)
      .orderBy("createdAt", "desc")
      .get();

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  },

  // =========================
  // FIND BY ID
  // =========================
  async findById(id) {
    const doc = await db.collection(JOBS_COLLECTION).doc(id).get();
    if (!doc.exists) return null;

    return {
      id: doc.id,
      ...doc.data()
    };
  },

  // =========================
  // SEARCH JOBS (text index replacement)
  // =========================
  async search(keyword) {
    const snapshot = await db
      .collection(JOBS_COLLECTION)
      .where("searchText", ">=", keyword.toLowerCase())
      .where("searchText", "<=", keyword.toLowerCase() + "\uf8ff")
      .get();

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  },

  // =========================
  // UPDATE JOB
  // =========================
  async update(id, updates) {
    await db.collection(JOBS_COLLECTION).doc(id).update(updates);
    return this.findById(id);
  },

  // =========================
  // DELETE JOB
  // =========================
  async delete(id) {
    await db.collection(JOBS_COLLECTION).doc(id).delete();
    return true;
  },

  // =========================
  // INCREMENT APPLICATION COUNT
  // =========================
  async incrementApplications(jobId) {
    const ref = db.collection(JOBS_COLLECTION).doc(jobId);

    await db.runTransaction(async (tx) => {
      const doc = await tx.get(ref);
      if (!doc.exists) throw new Error("Job not found");

      const count = doc.data().applicationsCount || 0;
      tx.update(ref, { applicationsCount: count + 1 });
    });
  }
};

module.exports = Job;