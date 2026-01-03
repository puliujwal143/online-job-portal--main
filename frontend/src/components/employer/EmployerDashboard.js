import React, { useState, useEffect, useContext } from 'react';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import Navbar from '../shared/Navbar';
import { AuthContext } from '../../context/AuthContext';
import './EmployerDashboard.css';

const EmployerDashboard = () => {
  const { user } = useContext(AuthContext);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showJobForm, setShowJobForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('jobs');

  const [jobForm, setJobForm] = useState({
    title: '',
    description: '',
    requirements: '',
    location: '',
    jobType: 'Full-time',
    category: 'IT',
    minSalary: '',
    maxSalary: '',
    experienceLevel: 'Mid Level',
    skills: '',
    applicationDeadline: ''
  });

  useEffect(() => {
    if (!user.isApproved) {
      toast.warning('Your account is pending admin approval');
    }
    fetchMyJobs();
  }, []);

  const fetchMyJobs = async () => {
    try {
      const { data } = await api.get('/jobs/my-jobs');
      setJobs(data);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to fetch jobs');
      setLoading(false);
    }
  };

  const fetchApplications = async (jobId) => {
    try {
      const { data } = await api.get(`/applications/job/${jobId}`);
      setApplications(data);
    } catch (error) {
      toast.error('Failed to fetch applications');
    }
  };

  const handleJobFormChange = (e) => {
    setJobForm({ ...jobForm, [e.target.name]: e.target.value });
  };

  const handleSubmitJob = async (e) => {
    e.preventDefault();

    const jobData = {
      ...jobForm,
      salary: {
        min: parseInt(jobForm.minSalary),
        max: parseInt(jobForm.maxSalary),
        currency: 'USD'
      },
      skills: jobForm.skills.split(',').map(s => s.trim())
    };

    try {
      await api.post('/jobs', jobData);
      toast.success('Job posted successfully! Waiting for admin approval.');
      setShowJobForm(false);
      fetchMyJobs();
      setJobForm({
        title: '',
        description: '',
        requirements: '',
        location: '',
        jobType: 'Full-time',
        category: 'IT',
        minSalary: '',
        maxSalary: '',
        experienceLevel: 'Mid Level',
        skills: '',
        applicationDeadline: ''
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to post job');
    }
  };

  const viewApplications = (job) => {
    setSelectedJob(job);
    fetchApplications(job.id);
    setActiveTab('applications');
  };

  const updateApplicationStatus = async (applicationId, status) => {
    try {
      await api.put(`/applications/${applicationId}/status`, { status });
      toast.success('Application status updated');
      fetchApplications(selectedJob.id);
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const deleteJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job?')) return;

    try {
      await api.delete(`/jobs/${jobId}`);
      toast.success('Job deleted successfully');
      fetchMyJobs();
    } catch (error) {
      toast.error('Failed to delete job');
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  if (!user.isApproved) {
    return (
      <div>
        <Navbar />
        <div className="container">
          <div className="card" style={{ marginTop: '40px', textAlign: 'center' }}>
            <h2>Account Pending Approval</h2>
            <p>Your employer account is awaiting admin approval. You'll be able to post jobs once approved.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="container employer-dashboard">
        <div className="dashboard-header">
          <h1>Employer Dashboard</h1>
          {activeTab === 'jobs' && (
            <button className="btn btn-primary" onClick={() => setShowJobForm(true)}>
              Post New Job
            </button>
          )}
        </div>

        <div className="tabs">
          <button
            className={activeTab === 'jobs' ? 'tab active' : 'tab'}
            onClick={() => setActiveTab('jobs')}
          >
            My Jobs ({jobs.length})
          </button>
          {selectedJob && (
            <button
              className={activeTab === 'applications' ? 'tab active' : 'tab'}
              onClick={() => setActiveTab('applications')}
            >
              Applications for "{selectedJob.title}" ({applications.length})
            </button>
          )}
        </div>

        {activeTab === 'jobs' && (
          <>
            {showJobForm && (
              <div className="modal">
                <div className="modal-content">
                  <div className="modal-header">
                    <h2>Post New Job</h2>
                    <button className="close-btn" onClick={() => setShowJobForm(false)}>×</button>
                  </div>
                  <form onSubmit={handleSubmitJob}>
                    <div className="form-group">
                      <label>Job Title *</label>
                      <input
                        type="text"
                        name="title"
                        value={jobForm.title}
                        onChange={handleJobFormChange}
                        required
                      />
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Category *</label>
                        <select name="category" value={jobForm.category} onChange={handleJobFormChange} required>
                          <option value="IT">IT</option>
                          <option value="Marketing">Marketing</option>
                          <option value="Sales">Sales</option>
                          <option value="Finance">Finance</option>
                          <option value="HR">HR</option>
                          <option value="Design">Design</option>
                          <option value="Engineering">Engineering</option>
                          <option value="Healthcare">Healthcare</option>
                          <option value="Education">Education</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label>Job Type *</label>
                        <select name="jobType" value={jobForm.jobType} onChange={handleJobFormChange} required>
                          <option value="Full-time">Full-time</option>
                          <option value="Part-time">Part-time</option>
                          <option value="Contract">Contract</option>
                          <option value="Internship">Internship</option>
                          <option value="Remote">Remote</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Location *</label>
                        <input
                          type="text"
                          name="location"
                          value={jobForm.location}
                          onChange={handleJobFormChange}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>Experience Level *</label>
                        <select name="experienceLevel" value={jobForm.experienceLevel} onChange={handleJobFormChange} required>
                          <option value="Entry Level">Entry Level</option>
                          <option value="Mid Level">Mid Level</option>
                          <option value="Senior Level">Senior Level</option>
                          <option value="Executive">Executive</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Min Salary (USD) *</label>
                        <input
                          type="number"
                          name="minSalary"
                          value={jobForm.minSalary}
                          onChange={handleJobFormChange}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>Max Salary (USD) *</label>
                        <input
                          type="number"
                          name="maxSalary"
                          value={jobForm.maxSalary}
                          onChange={handleJobFormChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Application Deadline *</label>
                      <input
                        type="date"
                        name="applicationDeadline"
                        value={jobForm.applicationDeadline}
                        onChange={handleJobFormChange}
                        min={new Date().toISOString().split('T')[0]}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Skills (comma-separated)</label>
                      <input
                        type="text"
                        name="skills"
                        value={jobForm.skills}
                        onChange={handleJobFormChange}
                        placeholder="e.g., JavaScript, React, Node.js"
                      />
                    </div>

                    <div className="form-group">
                      <label>Job Description *</label>
                      <textarea
                        name="description"
                        value={jobForm.description}
                        onChange={handleJobFormChange}
                        rows="5"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Requirements *</label>
                      <textarea
                        name="requirements"
                        value={jobForm.requirements}
                        onChange={handleJobFormChange}
                        rows="5"
                        required
                      />
                    </div>

                    <div className="form-actions">
                      <button type="submit" className="btn btn-primary">Post Job</button>
                      <button type="button" className="btn btn-secondary" onClick={() => setShowJobForm(false)}>
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            <div className="jobs-grid">
              {jobs.length === 0 ? (
                <p>No jobs posted yet. Click "Post New Job" to get started.</p>
              ) : (
                jobs.map((job) => (
                  <div key={job.id} className="card job-card">
                    <div className="job-header">
                      <h3>{job.title}</h3>
                      <span className={`badge badge-${job.status === 'open' ? 'success' : job.status === 'pending' ? 'warning' : 'danger'}`}>
                        {job.status}
                      </span>
                    </div>
                    <p><strong>Location:</strong> {job.location}</p>
                    <p><strong>Type:</strong> {job.jobType}</p>
                    <p><strong>Applications:</strong> {job.applicationsCount}</p>
                    <p>
  <strong>Deadline:</strong>{" "}
  {job.applicationDeadline?.toDate
    ? job.applicationDeadline.toDate().toLocaleDateString()
    : new Date(job.applicationDeadline).toLocaleDateString()}
</p>
                    <div className="job-actions">
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => viewApplications(job)}
                        disabled={job.applicationsCount === 0}
                      >
                        View Applications
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => deleteJob(job.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {activeTab === 'applications' && selectedJob && (
          <div className="applications-section">
            <button className="btn btn-secondary" onClick={() => setActiveTab('jobs')}>
              ← Back to Jobs
            </button>

            {applications.length === 0 ? (
              <p>No applications yet for this job.</p>
            ) : (
              <div className="applications-list">
                {applications.map((app) => (
                  <div key={app.id} className="card application-card">
                    <h3>{app.applicant.name}</h3>
                    <p><strong>Email:</strong> {app.applicant.email}</p>
                    <p><strong>Phone:</strong> {app.applicant.phone || 'N/A'}</p>
                    <p><strong>Location:</strong> {app.applicant.location || 'N/A'}</p>
                    <p><strong>Experience:</strong> {app.applicant.experience || 'N/A'}</p>
                    <p><strong>Skills:</strong> {app.applicant.skills?.join(', ') || 'N/A'}</p>
                    <p><strong>Applied:</strong> {new Date(app.appliedAt).toLocaleDateString()}</p>
                    <p><strong>Status:</strong> <span className={`badge badge-${app.status === 'accepted' ? 'success' : app.status === 'rejected' ? 'danger' : 'warning'}`}>{app.status}</span></p>
                    
                    {app.coverLetter && (
                      <div className="cover-letter">
                        <strong>Cover Letter:</strong>
                        <p>{app.coverLetter}</p>
                      </div>
                    )}

                    <div className="application-actions">
                      <a
                        href={`http://localhost:5000/${app.resume}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-primary btn-sm"
                      >
                        View Resume
                      </a>
                      
                      <select
                        value={app.status}
                        onChange={(e) => updateApplicationStatus(app._id, e.target.value)}
                        className="status-select"
                      >
                        <option value="pending">Pending</option>
                        <option value="reviewing">Reviewing</option>
                        <option value="shortlisted">Shortlisted</option>
                        <option value="accepted">Accepted</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployerDashboard;