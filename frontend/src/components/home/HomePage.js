import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';

const HomePage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    // Navigate to applicant registration/login with search params
    navigate('/register?role=applicant');
  };

  const handleGetStarted = (role) => {
    navigate('/register?role=' + role);
  };

  const navigateToLogin = () => {
    navigate('/login');
  };

  return (
    <div className="home-page">
      {/* Navigation Header */}
      <nav className="home-navbar">
        <div className="navbar-content">
          <div className="logo">
            <h2>Job Portal</h2>
          </div>
          <div className="nav-links">
            <button onClick={() => navigate('/login')} className="nav-link">
              Login
            </button>
            <button onClick={() => navigate('/register')} className="btn btn-primary">
              Sign Up
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            Find Your Dream Job Today
          </h1>
          <p className="hero-subtitle">
            Connect with top employers and discover thousands of job opportunities tailored to your skills and experience.
          </p>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="search-form">
            <div className="search-inputs">
              <input
                type="text"
                placeholder="Job title, keywords, or company"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              <input
                type="text"
                placeholder="City, state, or zip code"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="search-input"
              />
              <button type="submit" className="btn btn-search">
                Search Jobs
              </button>
            </div>
          </form>

          <p className="hero-stats">
          find your job here
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <h2 className="section-title">Why Choose Our Platform?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <div className="icon-circle">1</div>
              </div>
              <h3>Easy Job Search</h3>
              <p>Browse thousands of job listings with advanced filters to find the perfect match for your skills and preferences.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <div className="icon-circle">2</div>
              </div>
              <h3>Direct Applications</h3>
              <p>Apply to jobs instantly with your profile and resume. Track all your applications in one convenient dashboard.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <div className="icon-circle">3</div>
              </div>
              <h3>Real-time Updates</h3>
              <p>Get instant notifications when employers review your application and updates on your job search progress.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <div className="icon-circle">4</div>
              </div>
              <h3>Top Companies</h3>
              <p>Connect with leading companies across various industries actively looking for talented professionals.</p>
            </div>
          </div>
        </div>
      </section>


      {/* Call to Action Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Take the Next Step in Your Career?</h2>
            <p>Join thousands of professionals who have found their dream jobs through our platform.</p>
            <div className="cta-buttons">
              <button 
                onClick={() => navigate('/register')} 
                className="btn btn-primary btn-large"
              >
                Create Free Account
              </button>
              <button 
                onClick={navigateToLogin} 
                className="btn btn-secondary btn-large"
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-bottom">
            <p>&copy; 2024 Job Portal. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;