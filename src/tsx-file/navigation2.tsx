import { useContext, useState } from "react";
import { UserContext } from "../contexts/userContext";
import { Link, useLocation } from "react-router-dom";
import "../css/navigation2.css";
import logo from "../assets/anggarin-blue.jpg";

import { Home, User, LogOut, Menu, LayoutDashboard, FileText, Users } from 'lucide-react';


const Navigation2 = () => {
  const { state } = useContext(UserContext);
  const [isCollapsed, setIsCollapsed] = useState(true); // start closed
  const location = useLocation();

  // toggle open/close
  const openNav = () => setIsCollapsed(false);
  const closeNav = () => setIsCollapsed(true);

  // close if click outside navbar
  const handleOverlayClick = () => {
    closeNav();
  };

  return (
    <>
      {/* Hamburger icon outside navbar, shown only when nav is closed */}
      {isCollapsed && (
        <button
          className="nav-open-btn"
          onClick={openNav}
          aria-label="Open navigation"
        >
          <Menu size={24} />
        </button>
      )}

      {/* Overlay that covers rest of screen when nav is open */}
      {!isCollapsed && (
        <div
          className="overlay"
          onClick={handleOverlayClick}
          aria-hidden="true"
        />
      )}

      <nav className={`navigation2 ${isCollapsed ? "collapsed" : ""}`}>
        <img src={logo} alt="Logo" className="logo" />

        <div className="nav-links-2">
          <Link
            to="/dashboard"
            className={`nav-link${
              location.pathname === "/dashboard" ? " active" : ""
            }`}
          >
            <LayoutDashboard size={18} style={{ marginRight: "8px" }} />
            Dashboard
          </Link>
          <Link
            to="/budgetPlan"
            className={`nav-link${
              location.pathname === "/budgetPlan" ? " active" : ""
            }`}
          >
            <FileText size={18} style={{ marginRight: "8px" }} />
            Budget Plan
          </Link>
          <Link
            to="/publicBudgetPlan"
            className={`nav-link${
              location.pathname === "/publicBudgetPlan" ? " active" : ""
            }`}
          >
            <Users size={18} style={{ marginRight: "8px" }} />
            Public Plans
          </Link>
          <Link
            to="/profile"
            className={`nav-link${
              location.pathname === "/profile" ? " active" : ""
            }`}
          >
            <User size={18} style={{ marginRight: "8px" }} />
            Profile
          </Link>
        </div>

        <Link to="/landing" className="logout-btn">
          <LogOut size={16} />
          <span style={{ marginLeft: "8px" }}>Log Out</span>
        </Link>
      </nav>
    </>
  );
};

export default Navigation2;
