import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import Navbar from '../shared/Navbar';
import { useNavigate } from 'react-router-dom';
import './ApplicantDashboard.css';

const ApplicantDashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [activeTab, setActiveTab] = useState('jobs');
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    jobType: '',
    location: '',
    experienceLevel: '',
  });

  const navigate = useNavigate();

  // =========================
  // INITIAL LOAD
  // =========================
  useEffect(() => {
    fetchJobs();
    fetchMyApplications();
  }, []);

  // =========================
  // FETCH JOBS
  // =========================
  const fetchJobs = async () => {
    try {
      const params = new URLSearchParams();

      Object.keys(filters).forEach((key) => {
        if (filters[key]) params.append(key, filters[key]);
      });

      const { data } = await api.get('/jobs?' + params.toString());
      setJobs(data.jobs || []);
    } catch (error) {
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // FETCH MY APPLICATIONS
  // =========================
  const fetchMyApplications = async () => {
    try {
      const { data } = await api.get('/applications/my-applications');
      setMyApplications(data || []);
    } catch (error) {
      console.error('Failed to fetch applications', error);
    }
  };

  // =========================
  // HELPERS
  // =========================
  const hasApplied = (jobId) => {
    return myApplications.some((app) =>
      typeof app.job === 'string'
        ? app.job === jobId
        : app.job?.id === jobId
    );
  };

  const viewJobDetails = (jobId) => {
    navigate('/job/' + jobId);
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    if (date.toDate) return date.toDate().toLocaleDateString();
    return new Date(date).toLocaleDateString();
  };

  // =========================
  // FILTER HANDLERS
  // =========================
  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const applyFilters = () => fetchJobs();

  const resetFilters = () => {
    setFilters({
      search: '',
      category: '',
      jobType: '',
      location: '',
      experienceLevel: '',
    });
    setTimeout(fetchJobs, 100);
  };

  // =========================
  // RENDER
  // =========================
  if (loading) return <div className="loading">Loading jobs...</div>;

  return (
    <div>
      <Navbar />

      <div className="container applicant-dashboard">
        <h1>Find Your Dream Job</h1>

        {/* TABS */}
        <div className="tabs">
          <button
            className={activeTab === 'jobs' ? 'tab active' : 'tab'}
            onClick={() => setActiveTab('jobs')}
          >
            Browse Jobs ({jobs.length})
          </button>

          <button
            className={activeTab === 'applications' ? 'tab active' : 'tab'}
            onClick={() => setActiveTab('applications')}
          >
            My Applications ({myApplications.length})
          </button>
        </div>

        {/* ================= JOBS TAB ================= */}
        {activeTab === 'jobs' && (
          <>
            {/* FILTERS */}
            <div className="filters-section card">
              <h3>Filter Jobs</h3>

              <div className="filters-grid">
                <div className="form-group">
                <input
                  name="search"
                  placeholder="Search jobs..."
                  value={filters.search}
                  onChange={handleFilterChange}
                />
               </div>
               <div className="form-group">
                <select name="category" value={filters.category} onChange={handleFilterChange}>
                  <option value="">All Categories</option>
                  <option value="IT">IT</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Sales">Sales</option>
                  <option value="Finance">Finance</option>
                  <option value="HR">HR</option>
                </select>
                </div>
                <div className="form-group">
                <select name="jobType" value={filters.jobType} onChange={handleFilterChange}>
                  <option value="">All Types</option>
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Remote">Remote</option>
                </select>
</div>
<div className="form-group">
                <input
                  name="location"
                  placeholder="Location"
                  value={filters.location}
                  onChange={handleFilterChange}
                />
</div>
<div className="form-group">
                <select
                  name="experienceLevel"
                  value={filters.experienceLevel}
                  onChange={handleFilterChange}
                >
                  <option value="">All Levels</option>
                  <option value="Entry Level">Entry Level</option>
                  <option value="Mid Level">Mid Level</option>
                  <option value="Senior Level">Senior Level</option>
                </select>
                </div>

                <div className="filter-actions">
                  <button className="btn btn-primary" onClick={applyFilters}>
                    Apply
                  </button>
                  <button className="btn btn-secondary" onClick={resetFilters}>
                    Reset
                  </button>
                </div>
              </div>
            </div>

            {/* JOB LIST */}
            <div className="jobs-list">
              {jobs.length === 0 ? (
                <p>No jobs found</p>
              ) : (
                jobs.map((job) => (
                  <div key={job.id} className="card job-card">
                    <div className="job-content">
                    <h3>{job.title}</h3>
                    <p className="company">{job.company}</p>
                     <div className="job-meta">
                        <span className="badge badge-info">{job.category}</span>
                        <span className="badge badge-info">{job.jobType}</span>
                        <span className="badge badge-info">{job.experienceLevel}</span>
                      </div>
                    <p><strong>Location:</strong> {job.location}</p>
                    <p>
                      <strong>Salary:</strong> ${job.salary.min} – ${job.salary.max}
                    </p>

                    <p>
                      <strong>Deadline:</strong> {formatDate(job.applicationDeadline)}
                    </p>

                    <div className="job-footer">
                      <button
                        className="btn btn-primary"
                        onClick={() => viewJobDetails(job.id)}
                      >
                        {hasApplied(job.id) ? 'View Details' : 'Apply Now'}
                      </button>

                      {hasApplied(job.id) && (
                        <span className="badge badge-success">Applied</span>
                      )}
                    </div>
                  </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {/* ================= APPLICATIONS TAB ================= */}
        {activeTab === 'applications' && (
          <div className="applications-list">
            {myApplications.length === 0 ? (
              <p>You haven’t applied to any jobs yet</p>
            ) : (
              myApplications.map((app) => (
                <div key={app.id} className="card application-card">
                  <h3>{app.job?.title}</h3>
                  <p className="company">{app.job?.company}</p>

                  <p>Status: <strong>{app.status}</strong></p>
                  <p>Applied: {formatDate(app.appliedAt)}</p>

                  <button
                    className="btn btn-primary"
                    onClick={() => navigate('/job/' + app.job.id)}
                  >
                    View Job
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplicantDashboard;