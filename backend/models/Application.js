const { db } = require("../firebase");

const APPLICATIONS_COLLECTION = "applications";

const Application = {

  // =========================
  // APPLY FOR A JOB
  // =========================
  async create({ jobId, applicantId, resume, coverLetter }) {
    const existing = await db
      .collection(APPLICATIONS_COLLECTION)
      .where("job", "==", jobId)
      .where("applicant", "==", applicantId)
      .limit(1)
      .get();

    if (!existing.empty) {
      throw new Error("You have already applied for this job");
    }

    const dataToSave = {
      job: jobId,
      applicant: applicantId,
      resume,
      coverLetter: coverLetter || "",
      status: "pending",
      appliedAt: new Date(),
      reviewedAt: null,
      notes: ""
    };

    const ref = await db.collection(APPLICATIONS_COLLECTION).add(dataToSave);

    return {
      id: ref.id,
      ...dataToSave
    };
  },

  // =========================
  // GET ALL APPLICATIONS ✅ (REQUIRED FOR STATS)
  // =========================
  async getAll() {
    const snapshot = await db
      .collection(APPLICATIONS_COLLECTION)
      .get();

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  },

  // =========================
  // GET APPLICATIONS BY JOB
  // =========================
  async findByJob(jobId) {
    const snapshot = await db
      .collection(APPLICATIONS_COLLECTION)
      .where("job", "==", jobId)
      .orderBy("appliedAt", "desc")
      .get();

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  },

  // =========================
  // GET APPLICATIONS BY USER
  // =========================
  async findByApplicant(applicantId) {
    const snapshot = await db
      .collection(APPLICATIONS_COLLECTION)
      .where("applicant", "==", applicantId)
      .orderBy("appliedAt", "desc")
      .get();

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  },

  // =========================
  // UPDATE APPLICATION STATUS
  // =========================
  async updateStatus(id, status, notes = "") {
    const updates = {
      status,
      reviewedAt: new Date(),
      notes
    };

    await db.collection(APPLICATIONS_COLLECTION).doc(id).update(updates);

    const doc = await db.collection(APPLICATIONS_COLLECTION).doc(id).get();

    return {
      id: doc.id,
      ...doc.data()
    };
  },

  // =========================
  // FIND BY ID
  // =========================
  async findById(id) {
    const doc = await db.collection(APPLICATIONS_COLLECTION).doc(id).get();
    if (!doc.exists) return null;

    return {
      id: doc.id,
      ...doc.data()
    };
  }
};

module.exports = Application;