import { useEffect, useState } from "react";
import { useBudgetPlans } from "../contexts/budgetPlanContext";
import { useUser } from "../contexts/userContext";
import { Link, useNavigate } from "react-router-dom";
import Navigation2 from "./navigation2";
import "../css/budgetPlan.css";


const BudgetPlanPage = () => {
    const { state: { plans }, createPlan, getAllPlans } = useBudgetPlans();
    const { state: userState } = useUser();
    const [newPlan, setNewPlan] = useState({
        title: '',
        description: '',
        totalFund: 0
    });
    const navigate = useNavigate();

    useEffect(() => {
        getAllPlans();
    }, []);

    const handleCreatePlan = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userState.uid) return;
        
        await createPlan({
            ...newPlan,
            userId: userState.uid,
            members: [userState.uid],
            remainingFund: Number(newPlan.totalFund),
            totalFund: Number(newPlan.totalFund)    
        });
        setNewPlan({ title: '', description: '', totalFund: 0 });
    };

    const myPlans = plans.filter(plan => plan.userId === userState.uid);

    return (
        <div className="budget-plan-container">
            <Navigation2 />
            
            <div className="create-plan-section">
                <h2>Create New Budget Plan</h2>
                <form onSubmit={handleCreatePlan}>
                    <input
                        type="text"
                        placeholder="Title"
                        value={newPlan.title}
                        onChange={(e) => setNewPlan(p => ({...p, title: e.target.value}))}
                        required
                    />
                    <textarea
                        placeholder="Description"
                        value={newPlan.description}
                        onChange={(e) => setNewPlan(p => ({...p, description: e.target.value}))}
                        required
                    />
                    <input
                        type="number"
                        placeholder="Total Fund"
                        value={newPlan.totalFund}
                        onChange={(e) => setNewPlan(p => ({...p, totalFund: Number(e.target.value)}))}
                        required
                    />
                    <button type="submit">Create Plan</button>
                </form>
            </div>

            <div className="personal-plans-section">
                <h2>Your Budget Plans</h2>
                <div className="plans-grid">
                    {myPlans.map(plan => (
                        <div key={plan.planId} className="plan-card" onClick={() => navigate(`/budgetplan/${plan.planId}`)}>
                            <h3>{plan.title}</h3>
                            <p>{plan.description}</p>
                            <div className="plan-stats">
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
        </div>
    );
};

export default BudgetPlanPage;