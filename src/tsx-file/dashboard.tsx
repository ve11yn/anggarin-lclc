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
                <div className="header">
                <h2>
                    <b>Welcome back,</b> <span className="user-name">{userState.name}</span>
                </h2>
                </div>

                <div className="content-container">
                    <div className="left">
                        <div className="fund-stats">
                            <div className="total-budget">
                                <h2>Rp. {userPlans.reduce((sum, plan) => sum + plan.totalFund, 0).toLocaleString()}</h2>
                                <p>Total Funds Managed</p>
                            </div>
                            <div className="remaining-budget">
                                <h2>Rp. {userPlans.reduce((sum, plan) => sum + plan.remainingFund, 0).toLocaleString()}</h2>
                                <p>Remaining Funds</p>
                            </div>
                        </div>

                        <div className="your-plans">
                            <h3>Your Budget Plans</h3>
                            {userPlans.map(plan => (
                                <div key={plan.planId} className="plan-card" style={{paddingTop: '0.2rem',                                         paddingBottom:'0.5rem'
                                }}>

                                    <Link to={`/fundRequest/${plan.planId}`} className="link" 
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        width: '100%',
                                        textDecoration: 'none',
                                        color: 'inherit',
                                        paddingTop: '15px'
                                        }}>
                                        <div className="plan-card-left">
                                            <h4 style={{marginBottom: '0.5rem'}}>{plan.title}</h4>
                                            <p style={{fontSize: '0.6rem'}}>{plan.description}</p>
                                        </div>
                                        <div className="plan-metrics">
                                            <span>Total: Rp{plan.totalFund.toLocaleString()}</span>
                                            <span>Remaining: Rp{plan.remainingFund.toLocaleString()}</span>
                                            <span>Members: {plan.members.length}</span>
                                        </div>
                                    </Link>

                                    
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="right">
                        <div className="inbox-preview">
                            <h3>Inbox</h3>
                            
                            {fundRequestState.requests
                                .filter(r => r.status === 'pending')
                                .slice(0, 3)
                                .map(request => (
                                    <div key={request.requestId} className="inbox-item">
                                        <span>{request.requesterName}</span>
                                        <span>{request.description}</span>
                                        <span>Rp{request.fundAmount.toLocaleString()}</span>
                                    </div>
                                ))}


                            <Link to="/inbox">
                                <button>View Inbox ({fundRequestState.requests.filter(r => r.status === 'pending').length})</button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;   