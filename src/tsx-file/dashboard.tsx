import { useContext, useEffect, useState } from "react";
import { UserContext } from "../contexts/userContext";
import { useBudgetPlans } from "../contexts/budgetPlanContext";
import Navigation2 from "./navigation2";
import { Link } from "react-router-dom";
import "../css/dashboard.css";
import { useFundRequests } from "../contexts/fundRequestContext";


const Dashboard = () => {
    const { state: userState } = useContext(UserContext);
    const { getAllPlans, state: budgetPlanState } = useBudgetPlans();
    const [isNavCollapsed, setIsNavCollapsed] = useState(false);
    const {state: fundRequestState} = useFundRequests();

    useEffect(() => {
        getAllPlans();
    }, []);

    const userPlans = budgetPlanState.plans.filter(
        plan => plan.userId === userState.uid
    );

    return (
        <div className="page-container">
            <Navigation2 
                collapsed={isNavCollapsed} 
                onToggleCollapse={() => setIsNavCollapsed(!isNavCollapsed)}
            />

            <div className={`main-content-dashboard ${isNavCollapsed ? 'nav-collapsed' : ''}`}>
                <h3>Welcome, </h3>
                <h2><b>{userState.name}</b></h2>

                <div className="content-container">
                    <div className="left">
                        <div className="fund-stats">
                            <div className="total-budget">
                                <h2>Rp{userPlans.reduce((sum, plan) => sum + plan.totalFund, 0).toLocaleString()}</h2>
                                <p>Total Funds Managed</p>
                            </div>
                            <div className="remaining-budget">
                                <h2>Rp{userPlans.reduce((sum, plan) => sum + plan.remainingFund, 0).toLocaleString()}</h2>
                                <p>Remaining Funds</p>
                            </div>
                        </div>

                        <div className="your-plans">
                            <h3>Your Budget Plans</h3>
                            {userPlans.map(plan => (
                                <div key={plan.planId} className="plan-card">
                                    <h4>{plan.title}</h4>
                                    <p>{plan.description}</p>
                                    <div className="plan-metrics">
                                        <span>Total: Rp{plan.totalFund.toLocaleString()}</span>
                                        <span>Remaining: Rp{plan.remainingFund.toLocaleString()}</span>
                                        <span>Members: {plan.members.length}</span>
                                    </div>
                                    <Link to={`/fundRequest/${plan.planId}`}>
                                        <button>Manage Requests</button>
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="right">
                        <div className="inbox-preview">
                            <h3>Inbox</h3>
                            <Link to="/inbox">
                                <button>View Inbox ({fundRequestState.requests.filter(r => r.status === 'pending').length})</button>
                            </Link>
                            {fundRequestState.requests
                                .filter(r => r.status === 'pending')
                                .slice(0, 3)
                                .map(request => (
                                    <div key={request.requestId} className="inbox-item">
                                        <span>{request.requesterName}</span>
                                        <span>Rp{request.fundAmount.toLocaleString()}</span>
                                    </div>
                                ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;   