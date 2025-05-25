import { useParams } from "react-router-dom";
import { useFundRequests, } from "../contexts/fundRequestContext";
import { useBudgetPlans } from "../contexts/budgetPlanContext";
import { useUser } from "../contexts/userContext";
import { useEffect, useState } from "react";
import Navigation2 from "./navigation2";



const FundRequest = () => {
    const { planId } = useParams();
    const { createRequest, getPlanRequests, state } = useFundRequests();
    const { state: userState } = useUser();
    const [newRequest, setNewRequest] = useState({
        amount: 0,
        description: ""
    });


    const { approveRequest, rejectRequest } = useFundRequests();
    const { updateFunds, getPlan } = useBudgetPlans();

    const handleApproveRequest = async (requestId: string) => {
        try {
            const request = state.requests.find(r => r.requestId === requestId);
            if (!request) return;

            // Approve the request
            await approveRequest(requestId, userState.uid, updateFunds);
            
            // Refresh data
            const updatedPlan = await getPlan(planId!);
            const updatedRequests = await getPlanRequests(planId!);
        } catch (error) {
            console.error("Approval failed:", error);
        }
    };

    const handleReject = async (requestId: string) => {
        const reason = prompt("Enter rejection reason:") || "No reason provided";
        try {
            await rejectRequest(requestId, userState.uid, reason);
            await getPlanRequests(planId!);
        } catch (error) {
            console.error("Rejection failed:", error);
        }
    };

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



    // const handleApprove = async (requestId: string) => {
    //     try {
    //         const request = state.requests.find(r => r.requestId === requestId);
    //         if (!request) return;

    //         await approveRequest(requestId, userState.uid);
    //         await updateFunds(request.planId, -request.fundAmount);
            
    //         // Refresh data
    //         await getPlanRequests(request.planId);
    //     } catch (error) {
    //         console.error("Approval failed:", error);
    //     }
    // };


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
                                <button onClick={() => handleReject(request.requestId)}>
                                    Reject
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FundRequest;