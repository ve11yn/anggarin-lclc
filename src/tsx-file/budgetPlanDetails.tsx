// BudgetPlanDetailsPage.tsx

import { Link, useNavigate, useParams } from "react-router-dom";
import { BudgetPlanContext, useBudgetPlans } from "../contexts/budgetPlanContext";
import { useFundRequests } from "../contexts/fundRequestContext";
import { useEffect, useState } from "react";
import { useUser } from "../contexts/userContext";
import { getUserDetails, UserDetails } from "../contexts/userService";
import Navigation2 from "./navigation2";
import "../css/budgetPlanDetails.css";
import Navigation3 from "./navigation3";


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
      <Navigation3 />
      <Navigation2 />

      <div className="details-header-section">
        <div className="details-header-left">
          <h2>{plan.title}</h2>

          <div style={{ display: "flex", flexDirection: "row", gap: "10px" }}>
            <span className="private-badge">Private</span>
            <span>{plan.members.length} Members</span>
          </div>
        </div>
        <div className="details-header-right">
          <p>PROJECT BUDGET</p>
          <h3 style={{ fontSize: "1.5rem" }}>Rp. {plan.remainingFund}</h3>
          <h4>/ {plan.totalFund}</h4>
        </div>
      </div>

      <div className="details-content">
        <div className="details-content-grid">
          <div className="budget-overview" style={{ border: "none" }}>
            <h3 style={{ fontSize: "1rem" }}>Budget Overview</h3>
            {/* <div className="budget-breakdown">
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
            </div> */}

            <div className="detail-chart-container">
              <div className="detail-donut-chart">
                <div className="detail-chart-circle">
                  <div
                    className="detail-chart-segment"
                    style={{
                      background: `conic-gradient(
                              #1a237e ${
                                (plan.remainingFund / plan.totalFund) * 360
                              }deg,
                              #e0e0e0 ${
                                (plan.remainingFund / plan.totalFund) * 360
                              }deg 360deg
                          )`,
                    }}
                  ></div>
                </div>
                <div className="detail-chart-center">
                  <div className="detail-total-text">
                    Rp. {plan.totalFund.toLocaleString()}
                  </div>
                  <div className="detail-total-label">Total Fund</div>
                </div>
              </div>

              <div className="detail-plan-stats">
                <div className="detail-stat-item">
                  <h4 className="detail-stat-heading">Remaining</h4>
                  <span className="detail-stat-value">
                    Rp. {plan.remainingFund.toLocaleString()}
                  </span>
                </div>
                <div className="detail-members-count">
                  Members: {plan.members.length}
                </div>

                <Link 
                  to={`/fund-requests/${planId}/create`}
                  className="primary-button" 
                >
                  + Request
                </Link>
              </div>
            </div>
          </div>

          <div className="latest-events">
            <h3 style={{ fontSize: "1rem" }}>Fund Requests</h3>
            {requests.map((request) => {
              const content = (
                <div className="request-item">
                  <div className="request-header">
                    <span style={{ fontSize: "0.7rem" }}>
                      {request.requesterName}
                    </span>
                    <span>
                      {new Date(request.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="request-details">
                    <span>Rp{request.fundAmount.toLocaleString()}</span>
                    <span className={`request-status ${request.status}`}>
                      {request.status}
                    </span>
                  </div>
                </div>
              );

              return request.status === "pending" ? (
                <Link
                  key={request.requestId}
                  to={`/fundRequestDetail/${request.requestId}`}
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  {content}
                </Link>
              ) : (
                <div key={request.requestId}>{content}</div>
              );
            })}
          </div>

          <div className="members-list">
            <h3 style={{ fontSize: "1rem" }}>Members</h3>
            {memberDetails.map((member) => (
              <div key={member.uid} className="member-item">
                <div className="member-info">
                  <span style={{ fontSize: "1rem", marginBottom: "0px" }}>
                    <b>{member.name}</b>
                  </span>
                  <span>{member.position}</span>
                </div>
                <div className="member-contact">
                  <span>{member.email}</span>
                  <span>
                    Joined:{" "}
                    {new Date(member.joinDate || "").toLocaleDateString()}
                  </span>
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