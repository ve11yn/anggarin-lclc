import { useEffect } from "react";
import { useBudgetPlans } from "../contexts/budgetPlanContext";
import { useUser } from "../contexts/userContext";
import { Link, useNavigate } from "react-router-dom";
import Navigation2 from "./navigation2";
import "../css/budgetPlanPublic.css";

const PublicBudgetPlanPage = () => {
    const { state: { plans }, getAllPlans, addMember } = useBudgetPlans();
    const { state: userState } = useUser();

    useEffect(() => {
        getAllPlans();
    }, []);

    const handleJoinPlan = async (planId: string) => {
        if (!userState.uid) return;
        await addMember(planId, userState.uid);
    };

    // Filter out plans created by current user
    const publicPlans = plans.filter(plan => plan.userId !== userState.uid);
    const navigate = useNavigate();

    return (
        <div className="public-budgetplan-container">
            <Navigation2 />
            
            <div className="public-plans-section">
                <h2>Public Budget Plans</h2>
                <div className="plans-grid">
                    {publicPlans.map(plan => (
                    <Link to={`/budgetplan/${plan.planId}`} className="plan-card-link">
                        <div 
                        key={plan.planId} 
                        className="plan-card">
                            <h3>{plan.title}</h3>
                            <p>{plan.description}</p>
                            <div className="plan-status">
                                <span className="private-badge">Private</span>
                                <span className="view-only">View Only</span>
                            </div>
                            <div className="plan-stats">
                                <span>Total: Rp{plan.totalFund.toLocaleString()}</span>
                                <span>Remaining: Rp{plan.remainingFund.toLocaleString()}</span>
                            </div>
                            <div className="members">
                                <span>{plan.members.length} Members</span>
                            </div>
                        </div>
                    </Link>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PublicBudgetPlanPage;

