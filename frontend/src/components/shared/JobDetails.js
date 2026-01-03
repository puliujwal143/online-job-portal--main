import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../utils/api";
import Navbar from "./Navbar";
import { AuthContext } from "../../context/AuthContext";
import "./JobDetails.css";

const JobDetails = () => {
  const { id } = useParams(); // Firestore Job ID
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasApplied, setHasApplied] = useState(false);

  const [showApplyForm, setShowApplyForm] = useState(false);
  const [resume, setResume] = useState(null);
  const [coverLetter, setCoverLetter] = useState("");
  const [applying, setApplying] = useState(false);

  // =============================
  // FETCH JOB DETAILS
  // =============================
  useEffect(() => {
    fetchJob();
    if (user?.role === "applicant") {
      checkIfAlreadyApplied();
    }
    // eslint-disable-next-line
  }, [id]);

  const fetchJob = async () => {
    try {
      const { data } = await api.get(`/jobs/${id}`);
      setJob(data); // data.id exists (Firestore)
    } catch (error) {
      toast.error(
        error.response?.status === 404
          ? "Job not found"
          : "Failed to load job details"
      );
      setJob(null);
    } finally {
      setLoading(false);
    }
  };

  // =============================
  // CHECK IF ALREADY APPLIED
  // =============================
  const checkIfAlreadyApplied = async () => {
    try {
      const { data } = await api.get("/applications/my-applications");
      const applied = data.some(
        (app) => app.job?.id === id
      );
      setHasApplied(applied);
    } catch (error) {
      console.error("Failed to check application status", error);
    }
  };

  // =============================
  // FILE HANDLER
  // =============================
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error("Upload PDF, DOC or DOCX only");
      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File must be under 5MB");
      e.target.value = "";
      return;
    }

    setResume(file);
  };

  // =============================
  // APPLY FOR JOB
  // =============================
  const handleApplySubmit = async (e) => {
    e.preventDefault();

    if (!resume) {
      toast.error("Please upload your resume");
      return;
    }

    setApplying(true);

    const formData = new FormData();
    formData.append("jobId", id);
    formData.append("resume", resume);
    formData.append("coverLetter", coverLetter);

    try {
      await api.post("/applications", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Application submitted successfully");
      setHasApplied(true);
      setShowApplyForm(false);
      navigate("/applicant");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to apply");
    } finally {
      setApplying(false);
    }
  };

  // =============================
  // HELPERS
  // =============================
  const formatDate = (date) => {
    if (!date) return "N/A";
    if (date?.toDate) return date.toDate().toLocaleDateString();
    return new Date(date).toLocaleDateString();
  };

  const formatSalary = (value) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(value);

  // =============================
  // UI STATES
  // =============================
  if (loading) {
    return (
      <>
        <Navbar />
        <div className="loading">Loading job details...</div>
      </>
    );
  }

  if (!job) {
    return (
      <>
        <Navbar />
        <div className="loading">Job not found</div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container job-details-container">
        <button
          className="btn btn-secondary back-button"
          onClick={() => navigate(-1)}
        >
          Back
        </button>

        <div className="card job-details-card">
          <div className="job-header">
            <div>
              <h1>{job.title}</h1>
              <p className="company">{job.company}</p>
            </div>
            <span
              className={`badge badge-${
                job.status === "open" ? "success" : "danger"
              }`}
            >
              {job.status?.toUpperCase()}
            </span>
          </div>

          <div className="job-meta">
            <p><strong>Location:</strong> {job.location}</p>
            <p><strong>Type:</strong> {job.jobType}</p>
            <p><strong>Category:</strong> {job.category}</p>
            <p><strong>Experience:</strong> {job.experienceLevel}</p>
            <p>
              <strong>Salary:</strong>{" "}
              {formatSalary(job.salary?.min)} –{" "}
              {formatSalary(job.salary?.max)}
            </p>
            <p>
              <strong>Deadline:</strong>{" "}
              {formatDate(job.applicationDeadline)}
            </p>
            <p>
              <strong>Total Applications:</strong>{" "}
              {job.applicationsCount || 0}
            </p>
          </div>

          {job.skills?.length > 0 && (
            <div className="job-section">
              <h3>Skills</h3>
              <div className="skills-container">
                {job.skills.map((skill, i) => (
                  <span key={i} className="badge badge-info">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="job-section">
            <h3>Description</h3>
            <p>{job.description}</p>
          </div>

          <div className="job-section">
            <h3>Requirements</h3>
            <p>{job.requirements}</p>
          </div>

          {user?.role === "applicant" && job.status === "open" && (
            <div className="apply-section">
              {hasApplied ? (
                <div className="applied-message">
                  <span className="badge badge-success">
                    Already Applied
                  </span>
                </div>
              ) : (
                <button
                  className="btn btn-primary btn-large"
                  onClick={() => setShowApplyForm(true)}
                >
                  Apply Now
                </button>
              )}
            </div>
          )}
        </div>

        {showApplyForm && (
          <div className="modal">
            <div className="modal-content">
              <div className="modal-header">
                <h2>Apply for {job.title}</h2>
                <button
                  className="close-btn"
                  onClick={() => setShowApplyForm(false)}
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleApplySubmit}>
                <div className="form-group">
                  <label>Upload Resume</label>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Cover Letter (Optional)</label>
                  <textarea
                    rows="5"
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                  />
                </div>

                <div className="form-actions">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={applying}
                  >
                    {applying ? "Submitting..." : "Submit Application"}
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowApplyForm(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default JobDetails;