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
    experienceLevel: ''
  });
  
  const navigate = useNavigate();

  // Fetch jobs on component mount
  useEffect(() => {
    fetchJobs();
    fetchMyApplications();
  }, []);

  const fetchJobs = async () => {
    try {
      // Build query parameters from filters
      const params = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          params.append(key, filters[key]);
        }
      });

      const response = await api.get('/jobs?' + params.toString());
      setJobs(response.data.jobs);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to load jobs. Please try again.');
      setLoading(false);
    }
  };

  const fetchMyApplications = async () => {
    try {
      const response = await api.get('/applications/my-applications');
      setMyApplications(response.data);
    } catch (error) {
      console.error('Error fetching applications:', error);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prevFilters => ({
      ...prevFilters,
      [name]: value
    }));
  };

  const applyFilters = () => {
    fetchJobs();
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      category: '',
      jobType: '',
      location: '',
      experienceLevel: ''
    });
    // Fetch jobs after a short delay to ensure state is updated
    setTimeout(fetchJobs, 100);
  };

  const viewJobDetails = (jobId) => {
    navigate('/job/' + jobId);
  };

  const hasApplied = (jobId) => {
    return myApplications.some(application => application.job._id === jobId);
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return <div className="loading">Loading jobs...</div>;
  }

  return (
    <div>
      <Navbar />
      <div className="container applicant-dashboard">
        <h1>Find Your Dream Job</h1>

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

        {activeTab === 'jobs' && (
          <>
            <div className="filters-section card">
              <h3>Filter Jobs</h3>
              <div className="filters-grid">
                <div className="form-group">
                  <input
                    type="text"
                    name="search"
                    placeholder="Search jobs, companies..."
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
                    <option value="Design">Design</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Education">Education</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <select name="jobType" value={filters.jobType} onChange={handleFilterChange}>
                    <option value="">All Types</option>
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                    <option value="Remote">Remote</option>
                  </select>
                </div>

                <div className="form-group">
                  <input
                    type="text"
                    name="location"
                    placeholder="Location"
                    value={filters.location}
                    onChange={handleFilterChange}
                  />
                </div>

                <div className="form-group">
                  <select name="experienceLevel" value={filters.experienceLevel} onChange={handleFilterChange}>
                    <option value="">All Experience Levels</option>
                    <option value="Entry Level">Entry Level</option>
                    <option value="Mid Level">Mid Level</option>
                    <option value="Senior Level">Senior Level</option>
                    <option value="Executive">Executive</option>
                  </select>
                </div>

                <div className="filter-actions">
                  <button className="btn btn-primary" onClick={applyFilters}>
                    Apply Filters
                  </button>
                  <button className="btn btn-secondary" onClick={resetFilters}>
                    Reset
                  </button>
                </div>
              </div>
            </div>

            <div className="jobs-list">
              {jobs.length === 0 ? (
                <div className="no-results">
                  <p>No jobs found matching your criteria</p>
                  <button className="btn btn-primary" onClick={resetFilters}>
                    View All Jobs
                  </button>
                </div>
              ) : (
                jobs.map((job) => (
                  <div key={job._id} className="card job-card">
                    <div className="job-content">
                      <h3>{job.title}</h3>
                      <p className="company">{job.company}</p>
                      <div className="job-meta">
                        <span className="badge badge-info">{job.category}</span>
                        <span className="badge badge-info">{job.jobType}</span>
                        <span className="badge badge-info">{job.experienceLevel}</span>
                      </div>
                      <p className="location">Location: {job.location}</p>
                      <p className="salary">
                        Salary: ${job.salary.min.toLocaleString()} - ${job.salary.max.toLocaleString()}
                      </p>
                      <p className="description">{job.description.substring(0, 200)}...</p>
                      <p className="deadline">
                        Application Deadline: {formatDate(job.applicationDeadline)}
                      </p>
                      
                      <div className="job-footer">
                        <button
                          className="btn btn-primary"
                          onClick={() => viewJobDetails(job._id)}
                        >
                          {hasApplied(job._id) ? 'View Details' : 'Apply Now'}
                        </button>
                        {hasApplied(job._id) && (
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

        {activeTab === 'applications' && (
          <div className="applications-section">
            {myApplications.length === 0 ? (
              <div className="no-results">
                <p>You haven't applied to any jobs yet</p>
                <button className="btn btn-primary" onClick={() => setActiveTab('jobs')}>
                  Browse Jobs
                </button>
              </div>
            ) : (
              <div className="applications-list">
                {myApplications.map((application) => (
                  <div key={application._id} className="card application-card">
                    <h3>{application.job.title}</h3>
                    <p className="company">{application.job.company}</p>
                    <div className="app-details">
                      <p>Applied: {formatDate(application.appliedAt)}</p>
                      <p>
                        Status:{' '}
                        <span className={'badge badge-' + 
                          (application.status === 'accepted' ? 'success' : 
                           application.status === 'rejected' ? 'danger' : 
                           'warning')
                        }>
                          {application.status.toUpperCase()}
                        </span>
                      </p>
                    </div>
                    
                    {application.notes && (
                      <div className="notes">
                        <strong>Employer Notes:</strong>
                        <p>{application.notes}</p>
                      </div>
                    )}

                    <button
                      className="btn btn-primary"
                      onClick={() => navigate('/job/' + application.job._id)}
                    >
                      View Job Details
                    </button>
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

export default ApplicantDashboard;