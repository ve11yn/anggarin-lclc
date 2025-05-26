import { useEffect, useState } from "react";
import { useBudgetPlans } from "../contexts/budgetPlanContext";
import { useUser } from "../contexts/userContext";
import { Link, useNavigate } from "react-router-dom";
import Navigation2 from "./navigation2";
import Navigation3 from "./navigation3";

const PublicBudgetPlanPage = () => {
    const { state: { plans }, createPlan, getAllPlans } = useBudgetPlans();
    const { state: userState } = useUser();
    const [newPlan, setNewPlan] = useState({
        title: '',
        description: '',
        totalFund: 0
    });
    const navigate = useNavigate();
    const [showForm, setShowForm] = useState(false);


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

    // Filter out plans created by current user
    const myPlans = plans.filter(plan => plan.userId !== userState.uid);

    return (
        <div className="budget-plan-container">

            <Navigation3/>
            <Navigation2 />
            
            {showForm && (
                <div className="overlay">
                    <div className="popup-form">
                        <h3>Create New Budget Plan</h3>
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
                            <div className="form-actions">
                                <button
                                    type="submit"
                                    style={{
                                        padding: '0.75rem 1.5rem',
                                        backgroundColor: '#173782',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '6px',
                                        fontSize: '0.7rem',
                                        fontWeight: 500,
                                        cursor: 'pointer',
                                        marginRight: '0.5rem'
                                    }}
                                >
                                    Create
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    style={{
                                        padding: '0.75rem 1.5rem',
                                        backgroundColor: '#6c757d',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '6px',
                                        fontSize: '0.5rem',
                                        fontWeight: 500,
                                        cursor: 'pointer'
                                    }}
                                >
                                    x
                                </button>
                            </div>

                        </form>
                    </div>
                </div>
            )}



            <div className="personal-plans-section">

                <div className="header-button">
                    <h2>Public Budget Plan</h2>
                </div>

                <div className="plans-grid">
                    {myPlans.map(plan => (
                        <div key={plan.planId} className="plan-card" onClick={() => navigate(`/budgetplan/${plan.planId}`)}>


                            <h3 style={{fontSize: '1.2rem'}}>{plan.title}</h3>


                            
                            <div className="chart-container">

                                <div className="donut-chart">
                                    <div className="chart-circle">
                                    <div 
                                    className="chart-segment"
                                    style={{
                                        background: `conic-gradient(
                                        #1a237e ${(plan.remainingFund / plan.totalFund) * 360}deg,
                                        #e0e0e0 ${(plan.remainingFund / plan.totalFund) * 360}deg 360deg
                                        )`
                                    }}
                                    ></div>
                                    </div>
                                    <div className="chart-center">
                                        <div className="total-text">
                                        Rp. {plan.totalFund.toLocaleString()}
                                        </div>
                                        <div className="total-label">Total Fund</div>
                                    </div>
                                </div>

                                <div className="plan-stats">
                                <span style={{display:'flex', flexDirection: 'column', justifyContent:'start', textAlign:'left', padding: '10px 10px',  border:'none' }}>
                                    <h4 style={{margin:'0px 0px'}}>Remaining</h4>
                                    <span style={{ fontSize: "1.2rem" , border:'none',  padding: '5px 0px'}}>
                                        Rp. {plan.remainingFund.toLocaleString()}
                                    </span>
                                </span>
                                <span style={{width: '70px'}}>Members: {plan.members.length}</span>
                                </div>
                            </div>
                            </div>
                    ))}
                </div>
            </div>

            <div style={{height: '400px'}}></div>
        </div>
    );
};

export default PublicBudgetPlanPage;

