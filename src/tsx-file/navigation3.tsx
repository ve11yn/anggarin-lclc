import React from "react";
import { matchPath, useLocation } from "react-router-dom";
import { Bell } from "lucide-react";
import "../css/navigation3.css";
import logo from "../assets/anggarin-blue.jpg";

const getPageNameFromPath = (pathname: string) => {
  const routePatterns = [
    { pattern: "/fund-requests/:planId/create", name: "Create Fund Request" },
    { pattern: "/budgetPlan/:planId", name: "Budget Plan Details" },
    { pattern: "/fundRequest/:planId", name: "Fund Requests" },
    { pattern: "/dashboard", name: "Dashboard" },
    { pattern: "/profile", name: "My Profile" },
    { pattern: "/budgetPlan", name: "Budget Plans" },
    { pattern: "/publicBudgetPlan", name: "Public Budget Plans" }, // Changed to match actual route
    { pattern: "/inbox", name: "Fund Request Inbox" },
{ pattern: "/fundRequestDetail/:requestId", name: "Fund Request Details" },
    // Add more patterns as needed
  ];

  const matchedRoute = routePatterns.find(({ pattern }) => 
    matchPath(pattern, pathname)
  );

  return matchedRoute?.name || "Page";
};

const excludedPaths = ["/login", "/register", "/landing", "/details"];

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
