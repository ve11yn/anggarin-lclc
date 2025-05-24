import { useEffect } from "react";
import { useBudgetPlans } from "../contexts/budgetPlanContext";
import { useFundRequests } from "../contexts/fundRequestContext";
import { useUser } from "../contexts/userContext";
import Navigation2 from "./navigation2";


const Inbox = () => {
    const { state: userState } = useUser();
    const { getPlanRequests, state } = useFundRequests();
    const { getAllPlans, state: budgetPlanState } = useBudgetPlans();

    useEffect(() => {
        const loadRequests = async () => {
            // Get all plans owned by the user
            const ownedPlans = budgetPlanState.plans.filter(
                plan => plan.userId === userState.uid
            );
            
            // Get all requests from owned plans
            for (const plan of ownedPlans) {
                await getPlanRequests(plan.planId);
            }
        };
        
        getAllPlans();
        loadRequests();
    }, [userState.uid]);

    return (
        <div className="inbox-container">
            <Navigation2 />
            <h2>Fund Requests</h2>
            <div className="requests-grid">
                {state.requests.map(request => (
                    <div key={request.requestId} className="request-card">
                        <h3>Rp{request.fundAmount.toLocaleString()}</h3>
                        <p>{request.description}</p>
                        <p>Plan: {
                            budgetPlanState.plans.find(p => p.planId === request.planId)?.title
                        }</p>
                        <p>Status: {request.status}</p>
                        <div className="request-actions">
                            <button>Approve</button>
                            <button>Reject</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Inbox;