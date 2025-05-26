import React from "react";
import { useLocation } from "react-router-dom";
import { Bell } from "lucide-react";
import "../css/navigation3.css";
import logo from "../assets/anggarin-blue.jpg";

const getPageNameFromPath = (pathname) => {
  const routeMap = {
    "/dashboard": "Dashboard",
    "/profile": "My Profile",
    "/budgetPlan": "Budget Plans",
    "/budgetPlanDetails": "Budget Plan Details",
    "/budgetPlanPublic": "Public Budget Plans",
    "/fundRequest": "Fund Requests",
    "/fundRequestCreate": "Create Fund Request",
    "/inbox": "Fund Request Inbox",
  };

  return routeMap[pathname] || "Page";
};

const excludedPaths = ["/login", "/register", "/landing", "details"];

const Navigation3 = () => {
  const location = useLocation();

  // Don't render navbar on excluded pages
  if (excludedPaths.includes(location.pathname)) {
    return null;
  }

  const pageName = getPageNameFromPath(location.pathname);

  return (
    <div className="top-nav">
      <div className="top-nav-inner">
        <div className="top-nav-left">
          <img src={logo} alt="Logo" className="logo3" />
          <div className="separator"></div>
          <h1 className="page-title">{pageName}</h1>
        </div>
        <div className="top-nav-right">
          <button className="bell-button">
            <Bell className="icon" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Navigation3;
