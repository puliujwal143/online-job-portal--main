import React, { useState, useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import Navbar from '../shared/Navbar';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [pendingEmployers, setPendingEmployers] = useState([]);
  const [pendingJobs, setPendingJobs] = useState([]);
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchPendingEmployers();
    fetchPendingJobs();
  }, []);

  const fetchStats = async () => {
    try {
      const { data } = await api.get('/users/stats');
      setStats(data);
    } catch (error) {
      toast.error('Failed to fetch statistics');
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingEmployers = async () => {
    try {
      const { data } = await api.get('/users/pending-employers');
      setPendingEmployers(data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchPendingJobs = async () => {
    try {
      const { data } = await api.get('/jobs/admin/pending');
      setPendingJobs(data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchAllUsers = async () => {
    try {
      const { data } = await api.get('/users/all');
      setUsers(data.users);
    } catch (error) {
      toast.error('Failed to fetch users');
    }
  };

  const approveEmployer = async (id) => {
    try {
      await api.put(`/users/approve-employer/${id}`);
      toast.success('Employer approved successfully');
      fetchPendingEmployers();
      fetchStats();
    } catch (error) {
      toast.error('Failed to approve employer');
    }
  };

  const approveJob = async (id) => {
    try {
      await api.put(`/jobs/${id}/approve`);
      toast.success('Job approved successfully');
      fetchPendingJobs();
      fetchStats();
    } catch (error) {
      toast.error('Failed to approve job');
    }
  };

  const rejectJob = async (id) => {
    try {
      await api.put(`/jobs/${id}/reject`);
      toast.success('Job rejected');
      fetchPendingJobs();
    } catch (error) {
      toast.error('Failed to reject job');
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    
    try {
      await api.delete(`/users/${id}`);
      toast.success('User deleted successfully');
      fetchAllUsers();
      fetchStats();
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div>
      <Navbar />
      <div className="container admin-dashboard">
        <h1>Admin Dashboard</h1>

        <div className="tabs">
          <button
            className={activeTab === 'overview' ? 'tab active' : 'tab'}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button
            className={activeTab === 'employers' ? 'tab active' : 'tab'}
            onClick={() => {
              setActiveTab('employers');
              fetchPendingEmployers();
            }}
          >
            Pending Employers ({pendingEmployers.length})
          </button>
          <button
            className={activeTab === 'jobs' ? 'tab active' : 'tab'}
            onClick={() => {
              setActiveTab('jobs');
              fetchPendingJobs();
            }}
          >
            Pending Jobs ({pendingJobs.length})
          </button>
          <button
            className={activeTab === 'users' ? 'tab active' : 'tab'}
            onClick={() => {
              setActiveTab('users');
              fetchAllUsers();
            }}
          >
            All Users
          </button>
        </div>

        {activeTab === 'overview' && stats && (
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Total Users</h3>
              <p className="stat-number">{stats.users.total}</p>
            </div>
            <div className="stat-card">
              <h3>Job Seekers</h3>
              <p className="stat-number">{stats.users.applicants}</p>
            </div>
            <div className="stat-card">
              <h3>Employers</h3>
              <p className="stat-number">{stats.users.employers}</p>
            </div>
            <div className="stat-card">
              <h3>Pending Employers</h3>
              <p className="stat-number">{stats.users.pendingEmployers}</p>
            </div>
            <div className="stat-card">
              <h3>Total Jobs</h3>
              <p className="stat-number">{stats.jobs.total}</p>
            </div>
            <div className="stat-card">
              <h3>Active Jobs</h3>
              <p className="stat-number">{stats.jobs.open}</p>
            </div>
            <div className="stat-card">
              <h3>Pending Jobs</h3>
              <p className="stat-number">{stats.jobs.pending}</p>
            </div>
            <div className="stat-card">
              <h3>Total Applications</h3>
              <p className="stat-number">{stats.applications.total}</p>
            </div>
          </div>
        )}

        {activeTab === 'employers' && (
          <div className="table-container">
            <h2>Pending Employer Approvals</h2>
            {pendingEmployers.length === 0 ? (
              <p>No pending employer approvals</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Company</th>
                    <th>Phone</th>
                    <th>Location</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingEmployers.map((employer) => (
                    <tr key={employer._id}>
                      <td>{employer.name}</td>
                      <td>{employer.email}</td>
                      <td>{employer.company}</td>
                      <td>{employer.phone || 'N/A'}</td>
                      <td>{employer.location || 'N/A'}</td>
                      <td>
                        <button
                          className="btn btn-success btn-sm"
                          onClick={() => approveEmployer(employer._id)}
                        >
                          Approve
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === 'jobs' && (
          <div className="jobs-list">
            <h2>Pending Job Approvals</h2>
            {pendingJobs.length === 0 ? (
              <p>No pending job approvals</p>
            ) : (
              pendingJobs.map((job) => (
                <div key={job._id} className="card job-card">
                  <h3>{job.title}</h3>
                  <p><strong>Company:</strong> {job.company}</p>
                  <p><strong>Posted by:</strong> {job.postedBy.name} ({job.postedBy.email})</p>
                  <p><strong>Location:</strong> {job.location}</p>
                  <p><strong>Type:</strong> {job.jobType}</p>
                  <p><strong>Category:</strong> {job.category}</p>
                  <p><strong>Experience:</strong> {job.experienceLevel}</p>
                  <p><strong>Salary:</strong> ${job.salary.min.toLocaleString()} - ${job.salary.max.toLocaleString()}</p>
                  <p><strong>Description:</strong> {job.description}</p>
                  <div className="job-actions">
                    <button
                      className="btn btn-success"
                      onClick={() => approveJob(job._id)}
                    >
                      Approve
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => rejectJob(job._id)}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'users' && (
          <div className="table-container">
            <h2>All Users</h2>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Company</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td><span className="badge badge-info">{user.role}</span></td>
                    <td>{user.company || 'N/A'}</td>
                    <td>
                      {user.role === 'employer' && (
                        <span className={user.isApproved ? 'badge badge-success' : 'badge badge-warning'}>
                          {user.isApproved ? 'Approved' : 'Pending'}
                        </span>
                      )}
                    </td>
                    <td>
                      {user.role !== 'admin' && (
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => deleteUser(user._id)}
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;