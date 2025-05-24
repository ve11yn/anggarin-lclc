import { useContext, useState } from "react";
import { UserContext } from "../contexts/userContext";
import { Link, useLocation } from "react-router-dom";
import "../css/navigation2.css";

const Navigation2 = () => {
    const {state} = useContext(UserContext);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const location = useLocation();

    const toggleNavigation = () => {
        setIsCollapsed(!isCollapsed);
    };

    return (
        <>
            <button 
                className="nav-toggle-btn"
                onClick={toggleNavigation}
            >
                {isCollapsed ? "→" : "←"}
            </button>
            <div className={`navigation2 ${isCollapsed ? 'collapsed' : ''}`}>
                <div>
                    <h2>Anggar.in</h2>
                </div>

                <div className="nav-links-2">
                    <Link to="/dashboard" className={`nav-link${location.pathname === "/dashboard" ? " active" : ""}`}>Dashboard</Link>
                    <Link to="/budgetPlan" className={`nav-link${location.pathname === "/budgetPlan" ? " active" : ""}`}>Budget Plan</Link>
                    <Link to="/publicBudgetPlan" className={`nav-link${location.pathname === "/publicBudgetPlan" ? " active" : ""}`}>Public Plans</Link>
                    <Link to="/profile" className={`nav-link${location.pathname === "/profile" ? " active" : ""}`}>Profile</Link>
                </div>

                <button>Log Out</button>
            </div>
        </>
    )
};

export default Navigation2;