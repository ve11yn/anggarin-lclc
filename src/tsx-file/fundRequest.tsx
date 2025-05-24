import { useParams } from "react-router-dom";
import { useFundRequests } from "../contexts/fundRequestContext";
import { useBudgetPlans } from "../contexts/budgetPlanContext";
import { useUser } from "../contexts/userContext";
import { useEffect, useState } from "react";
import Navigation2 from "./navigation2";



const FundRequest = () => {
    const { planId } = useParams();
    const { createRequest, getPlanRequests, state } = useFundRequests();
    const { getPlan } = useBudgetPlans();
    const { state: userState } = useUser();
    const [newRequest, setNewRequest] = useState({
        amount: 0,
        description: ""
    });

    useEffect(() => {
        if (planId) {
            getPlanRequests(planId);
            getPlan(planId);
        }
    }, [planId]);

    const handleCreateRequest = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!planId || !userState.uid) return;
        
        await createRequest({
            planId,
            requesterId: userState.uid,
            requesterName: userState.name,
            fundAmount: newRequest.amount,
            description: newRequest.description
        });
        setNewRequest({ amount: 0, description: "" });
    };

    const handleApproveRequest = async (requestId: string) => {
        // Implement approval logic
    };

    return (
        <div className="fund-request-container">
            <Navigation2 />
            
            <div className="request-section">
                <h2>Create New Fund Request</h2>
                <form onSubmit={handleCreateRequest}>
                    <input
                        type="number"
                        value={newRequest.amount}
                        onChange={(e) => setNewRequest(p => ({...p, amount: Number(e.target.value)}))}
                        placeholder="Amount"
                        required
                    />
                    <textarea
                        value={newRequest.description}
                        onChange={(e) => setNewRequest(p => ({...p, description: e.target.value}))}
                        placeholder="Purpose"
                        required
                    />
                    <button type="submit">Submit Request</button>
                </form>
            </div>

            <div className="requests-list">
                <h2>All Requests</h2>
                {state.requests.map(request => (
                    <div key={request.requestId} className="request-card">
                        <p>Amount: Rp{request.fundAmount.toLocaleString()}</p>
                        <p>Description: {request.description}</p>
                        <p>Status: {request.status}</p>
                        <p>Requester: {request.requesterId}</p>
                        
                        {userState.uid === request.requesterId && (
                            <div className="request-actions">
                                <button onClick={() => handleApproveRequest(request.requestId)}>
                                    Approve
                                </button>
                                <button>Reject</button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FundRequest;