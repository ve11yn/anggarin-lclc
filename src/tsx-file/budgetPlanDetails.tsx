// BudgetPlanDetailsPage.tsx

import { Link, useNavigate, useParams } from "react-router-dom";
import { BudgetPlanContext, useBudgetPlans } from "../contexts/budgetPlanContext";
import { useFundRequests } from "../contexts/fundRequestContext";
import { useEffect, useState } from "react";
import { useUser } from "../contexts/userContext";
import { getUserDetails, UserDetails } from "../contexts/userService";
import Navigation2 from "./navigation2";
import "../css/budgetPlanDetails.css";


const BudgetPlanDetailsPage = () => {
  const { planId } = useParams();
  const { getPlan, addMember, state: { plans } } = useBudgetPlans();
  const { getPlanRequests, state: { requests } } = useFundRequests();
  const [plan, setPlan] = useState<BudgetPlanContext | null>(null);
  const {state : userState} = useUser();
  const [memberDetails, setMemberDetails] = useState<UserDetails[]>([]);
  const navigate = useNavigate();
  const handleJoinPlan = async () => {
    if (!userState.uid || !planId) {
      alert('Please login to join this plan');
      navigate('/login');
      return;
    }
  
    try {
      console.log('Attempting to join plan:', planId);
      console.log('User UID:', userState.uid);
      
      await addMember(planId, userState.uid);
      console.log('Successfully added to members');
      
      const updatedPlan = await getPlan(planId);
      console.log('Updated plan data:', updatedPlan);
      
      const details = await Promise.all(
        updatedPlan?.members.map(userId => getUserDetails(userId)) || []
      );
      setMemberDetails(details);
      
    } catch (error) {
      console.error('Join plan error:', error);
      alert('Failed to join plan');
    }
  };

  const isMember = plan?.members.includes(userState.uid);

  useEffect(() => {
    const loadData = async () => {
      if (planId) {
        const planData = await getPlan(planId);
        setPlan(planData);
        await getPlanRequests(planId);
      }
    };
    loadData();
  }, [planId]);

  useEffect(() => {
    const loadMemberDetails = async () => {
        if (plan) {
            const details = await Promise.all(
                plan.members.map(userId => getUserDetails(userId))
            );
            setMemberDetails(details);
        }
    };
    
    loadMemberDetails();
    }, [plan]);

  if (!plan) return <div>Loading...</div>;

  return (
    <div className="budgetplan-details-container">
      <Navigation2 />
      
      <div className="details-header-section">

        <div className="details-header-left">
          <h2>{plan.title}</h2>

          <div style={{display: 'flex', flexDirection:'row', gap: '10px'}}>
            <span className="private-badge">Private</span>
            <span>{plan.members.length} Members</span>
          </div>
        </div>
        <div className="details-header-right">
          <p>PROJECT BUDGET</p>
          <h3 style={{fontSize:'1.5rem'}}>Rp. {plan.remainingFund}</h3>
          <h4>/ {plan.totalFund}</h4>
        </div>
      </div>


      <div className="details-content">
        <div className="details-content-grid">
          <div className="budget-overview">
            <h3>Budget Overview</h3>
            <div className="budget-breakdown">
              <div className="budget-item">
                <div>
                    <p>Total Fund</p>
                    <span>Rp. {plan.totalFund}</span>
                </div>

                <div>
                    <p>Remaining Fund</p>
                    <span>Rp. {plan.remainingFund}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="latest-events">
            <h3>Latest Fund Requests</h3>
            {requests.map(request => (
              <div key={request.requestId} className="request-item">
                <div className="request-header">
                  <span>{request.requesterName}</span>
                  <span>{new Date(request.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="request-details">
                  <span>Rp{request.fundAmount.toLocaleString()}</span>
                  <span>{request.status}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="members-list">
            <h3>Members</h3>
            {memberDetails.map(member => (
                <div key={member.uid} className="member-item">
                    <div className="member-info">
                        <span>{member.name}</span>
                        <span>{member.position}</span>
                    </div>
                    <div className="member-contact">
                        <span>{member.email}</span>
                        <span>Joined: {new Date(member.joinDate || "").toLocaleDateString()}</span>
                    </div>
                </div>
            ))}
          </div>

          {/* <div className="actions">
                {!isMember && (
                    <button 
                    onClick={handleJoinPlan}
                    className="join-button"
                    >
                    Join Plan
                    </button>
                )}
                {isMember && (
                    <Link 
                    to={`/fund-requests/${planId}/create`}
                    className="create-request-button"
                    >
                    Create Request
                    </Link>
                )}
            </div> */}
        </div>

        
      </div>
    </div>
  );
};

export default BudgetPlanDetailsPage;