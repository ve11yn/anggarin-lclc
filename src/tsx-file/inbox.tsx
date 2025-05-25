import { useEffect, useState } from "react";
import { useUser } from "../contexts/userContext";
import { FundRequest, useFundRequests } from "../contexts/fundRequestContext";
import { useBudgetPlans } from "../contexts/budgetPlanContext";
import Navigation2 from "./navigation2";
import "../css/inbox.css";

// In Inbox.tsx
const Inbox = () => {
    const { state: userState } = useUser();
    const { getPlanRequests, approveRequest, rejectRequest } = useFundRequests();
    const { getAllPlans, state: budgetPlanState } = useBudgetPlans();
    const { updateFunds } = useBudgetPlans();
    const [inboxRequests, setInboxRequests] = useState<FundRequest[]>([]);

    useEffect(() => {
        const loadRequests = async () => {
            const ownedPlans = budgetPlanState.plans.filter(
                plan => plan.userId === userState.uid
            );
            
            const allRequests = [];
            for (const plan of ownedPlans) {
                const requests = await getPlanRequests(plan.planId);
                allRequests.push(...requests.filter(r => r.status === 'pending'));
            }
            
            setInboxRequests(allRequests);
        };
        
        getAllPlans();
        loadRequests();
    }, [userState.uid]);

    const handleApprove = async (requestId: string) => {
        try {
            const request = inboxRequests.find(r => r.requestId === requestId);
            if (!request) return;

            await approveRequest(requestId, userState.uid, updateFunds);
            setInboxRequests(prev => prev.filter(r => r.requestId !== requestId));
        } catch (error) {
            console.error("Approval failed:", error);
        }
    };

    const handleReject = async (requestId: string) => {
        const reason = prompt("Enter rejection reason:") || "No reason provided";
        try {
            await rejectRequest(requestId, userState.uid, reason);
            setInboxRequests(prev => prev.filter(r => r.requestId !== requestId));
        } catch (error) {
            console.error("Rejection failed:", error);
        }
    };

    return (
        <div className="inbox-container">
            <Navigation2 />
            <h2>Pending Fund Requests</h2>
            <div className="requests-grid">
                {inboxRequests.map(request => (
                    <div key={request.requestId} className="request-card">
                        <h3>Rp{request.fundAmount.toLocaleString()}</h3>
                        <p>{request.description}</p>
                        <p>Plan: {
                            budgetPlanState.plans.find(p => p.planId === request.planId)?.title
                        }</p>
                        <div className="request-actions">
                            <button onClick={() => handleApprove(request.requestId)}>
                                Approve
                            </button>
                            <button onClick={() => handleReject(request.requestId)}>
                                Reject
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Inbox;