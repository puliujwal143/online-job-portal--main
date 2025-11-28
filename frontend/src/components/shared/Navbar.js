import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to={'/' + user.role} className="navbar-logo">
          Job Portal
        </Link>
        
        <div className="navbar-right">
          <span className="navbar-user">
            {user.name} <span className="role-badge">({user.role})</span>
          </span>
          <button onClick={handleLogout} className="btn btn-secondary"style={{color:'white'}}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;