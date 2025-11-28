import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import Navbar from './Navbar';
import { AuthContext } from '../../context/AuthContext';
import './JobDetails.css';

const JobDetails = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [job, setJob] = useState(null);
  const [hasApplied, setHasApplied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [resume, setResume] = useState(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    fetchJobDetails();
    if (user.role === 'applicant') {
      checkIfAlreadyApplied();
    }
  }, [id]);

  const fetchJobDetails = async () => {
    try {
      const response = await api.get('/jobs/' + id);
      setJob(response.data);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to load job details');
      setLoading(false);
    }
  };

  const checkIfAlreadyApplied = async () => {
    try {
      const response = await api.get('/applications/my-applications');
      const applications = response.data;
      const applied = applications.some(app => app.job._id === id);
      setHasApplied(applied);
    } catch (error) {
      console.error('Error checking application status:', error);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      
      if (!validTypes.includes(file.type)) {
        toast.error('Please upload PDF, DOC, or DOCX file only');
        e.target.value = '';
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        e.target.value = '';
        return;
      }
      
      setResume(file);
    }
  };

  const handleApplySubmit = async (e) => {
    e.preventDefault();

    if (!resume) {
      toast.error('Please upload your resume');
      return;
    }

    setApplying(true);

    const formData = new FormData();
    formData.append('jobId', id);
    formData.append('resume', resume);
    formData.append('coverLetter', coverLetter);

    try {
      await api.post('/applications', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      toast.success('Application submitted successfully!');
      setShowApplyForm(false);
      setHasApplied(true);
      navigate('/applicant');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to submit application';
      toast.error(errorMessage);
    } finally {
      setApplying(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatSalary = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="loading">Loading job details...</div>
      </div>
    );
  }

  if (!job) {
    return (
      <div>
        <Navbar />
        <div className="loading">Job not found</div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="container job-details-container">
        <button className="btn btn-secondary back-button" onClick={() => navigate(-1)}>
          Back
        </button>

        <div className="card job-details-card">
          <div className="job-header">
            <div>
              <h1>{job.title}</h1>
              <p className="company">{job.company}</p>
            </div>
            <span className={'badge badge-' + (job.status === 'open' ? 'success' : 'danger')}>
              {job.status.toUpperCase()}
            </span>
          </div>

          <div className="job-meta">
            <div className="meta-item">
              <strong>Location:</strong> {job.location}
            </div>
            <div className="meta-item">
              <strong>Job Type:</strong> {job.jobType}
            </div>
            <div className="meta-item">
              <strong>Category:</strong> {job.category}
            </div>
            <div className="meta-item">
              <strong>Experience Level:</strong> {job.experienceLevel}
            </div>
            <div className="meta-item">
              <strong>Salary Range:</strong> {formatSalary(job.salary.min)} - {formatSalary(job.salary.max)}
            </div>
            <div className="meta-item">
              <strong>Application Deadline:</strong> {formatDate(job.applicationDeadline)}
            </div>
            <div className="meta-item">
              <strong>Total Applications:</strong> {job.applicationsCount}
            </div>
          </div>

          {job.skills && job.skills.length > 0 && (
            <div className="job-section">
              <h3>Required Skills</h3>
              <div className="skills-container">
                {job.skills.map((skill, index) => (
                  <span key={index} className="badge badge-info skill-badge">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="job-section">
            <h3>Job Description</h3>
            <p className="job-description">{job.description}</p>
          </div>

          <div className="job-section">
            <h3>Requirements</h3>
            <p className="job-requirements">{job.requirements}</p>
          </div>

          <div className="job-section">
            <h3>Contact Information</h3>
            <p><strong>Posted by:</strong> {job.postedBy?.name}</p>
            {job.postedBy?.email && <p><strong>Email:</strong> {job.postedBy.email}</p>}
            {job.postedBy?.phone && <p><strong>Phone:</strong> {job.postedBy.phone}</p>}
          </div>

          {user.role === 'applicant' && job.status === 'open' && (
            <div className="apply-section">
              {hasApplied ? (
                <div className="applied-message">
                  <span className="badge badge-success large-badge">Already Applied</span>
                  <p>You have already submitted your application for this position</p>
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
                  aria-label="Close"
                >
                  &times;
                </button>
              </div>

              <form onSubmit={handleApplySubmit}>
                <div className="form-group">
                  <label htmlFor="resume">
                    Upload Resume (Required)
                  </label>
                  <p className="file-requirements">
                    Accepted formats: PDF, DOC, DOCX - Maximum size: 5MB
                  </p>
                  <input
                    id="resume"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                    required
                  />
                  {resume && (
                    <p className="file-info success-text">Selected file: {resume.name}</p>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="coverLetter">Cover Letter (Optional)</label>
                  <p className="field-hint">
                    Tell us why you're a great fit for this position
                  </p>
                  <textarea
                    id="coverLetter"
                    rows="6"
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    placeholder="Write your cover letter here..."
                  />
                </div>

                <div className="form-actions">
                  <button 
                    type="submit" 
                    className="btn btn-primary" 
                    disabled={applying}
                  >
                    {applying ? 'Submitting Application...' : 'Submit Application'}
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => setShowApplyForm(false)}
                    disabled={applying}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobDetails;