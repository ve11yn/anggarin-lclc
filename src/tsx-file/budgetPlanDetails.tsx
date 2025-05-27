// BudgetPlanDetailsPage.tsx

import { Link, useNavigate, useParams } from "react-router-dom";
import { BudgetPlanContext, useBudgetPlans } from "../contexts/budgetPlanContext";
import { FundRequest, useFundRequests } from "../contexts/fundRequestContext";
import { useEffect, useState } from "react";
import { useUser } from "../contexts/userContext";
import { getUserDetails, UserDetails } from "../contexts/userService";
import Navigation2 from "./navigation2";
import "../css/budgetPlanDetails.css";
import Navigation3 from "./navigation3";

const BudgetPlanDetailsPage = () => {
  const { planId } = useParams();
  const { getPlan, addMember, updateFunds, state: { plans } } = useBudgetPlans();
  const { getPlanRequests, approveRequest, rejectRequest, state: { requests } } = useFundRequests();
  const [plan, setPlan] = useState<BudgetPlanContext | null>(null);
  const { state: userState } = useUser();
  const [memberDetails, setMemberDetails] = useState<UserDetails[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<FundRequest | null>(null);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  // Check if current user is a member of the plan
  const isMember = plan?.members.includes(userState.uid || '') || false;
  
  // Check if current user is the owner of the plan
  const isOwner = plan?.userId === userState.uid;
  
  useEffect(() => {
    const loadData = async () => {
      if (!planId) return;
  
      try {
        // Always fetch fresh plan data
        const planData = await getPlan(planId);
        if (!planData) return;
  
        setPlan({
          ...planData,
          // Ensure numeric values
          totalFund: Number(planData.totalFund),
          remainingFund: Number(planData.remainingFund)
        });
  
        // Load member details with error handling
        const details = await Promise.all(
          planData.members.map(async userId => {
            try {
              return await getUserDetails(userId);
            } catch (error) {
              console.error(`Failed to fetch user ${userId}:`, error);
              return null;
            }
          })
        );
        setMemberDetails(details.filter(Boolean) as UserDetails[]);
  
        // Force refresh requests
        await getPlanRequests(planId);
  
      } catch (error) {
        console.error("Failed to load plan data:", error);
      }
    };
  
    loadData();
  }, [planId, getPlan, getPlanRequests, requests.length]); // Add requests.length as dependency
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
      
      setPlan(updatedPlan);
      
      const details = await Promise.all(
        updatedPlan?.members.map(userId => getUserDetails(userId)) || []
      );
      setMemberDetails(details);
      
    } catch (error) {
      console.error('Join plan error:', error);
      alert('Failed to join plan');
    }
  };
  
  const handleApprove = async (requestId: string) => {
    try {
      await approveRequest(requestId, userState.uid || '', updateFunds);
      // Reload the plan data and requests
      if (planId) {
        const updatedPlan = await getPlan(planId);
        setPlan(updatedPlan);
        await getPlanRequests(planId);
      }
      setShowModal(false);
      setSelectedRequest(null);
    } catch (error) {
      console.error("Approval failed:", error);
      alert("Failed to approve request");
    }
  };

  const handleReject = async (requestId: string) => {
    const reason = prompt("Enter rejection reason:") || "No reason provided";
    try {
      await rejectRequest(requestId, userState.uid || '', reason);
      // Reload requests
      if (planId) {
        await getPlanRequests(planId);
      }
      setShowModal(false);
      setSelectedRequest(null);
    } catch (error) {
      console.error("Rejection failed:", error);
      alert("Failed to reject request");
    }
  };

  const handleRequestClick = (request: FundRequest) => {
    if (request.status === "pending") {
      setSelectedRequest(request);
      setShowModal(true);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedRequest(null);
  };


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
            <h3 style={{ fontSize: "1rem", paddingBottom: "30px"}}>Budget Overview</h3>

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

                {/* Conditional button based on membership status */}
                {!isMember ? (
                  <button 
                    onClick={handleJoinPlan}
                    className="primary-button"
                  >
                    Join Plan
                  </button>
                ) : (
                  <Link 
                    to={`/fund-requests/${planId}/create`}
                    className="primary-button" 
                  >
                    + Request
                  </Link>
                )}
              </div>
            </div>
          </div>

          <div className="latest-events">
            <h3 style={{ fontSize: "1rem" }}>Fund Requests</h3>
            {requests.map((request) => (
              <div 
                key={request.requestId} 
                className="request-item"
                onClick={() => handleRequestClick(request)}
                style={{ 
                  cursor: request.status === "pending" ? "pointer" : "default",
                  opacity: request.status === "pending" ? 1 : 0.7
                }}
              >
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
            ))}
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
        </div>
      </div>

      {/* Modal for Fund Request Details */}
      {showModal && selectedRequest && (
        <div className="modal-overlay" style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1000
        }}>
          <div className="modal-content" style={{
            backgroundColor: "white",
            borderRadius: "8px",
            maxWidth: "600px",
            width: "90%",
            maxHeight: "80vh",
            overflowY: "auto",
            position: "relative",
            boxShadow: "0 2px 12px rgba(0, 0, 0, 0.08)",
            border: "1px solid #e9ecef"
          }}>
            <button 
              onClick={closeModal}
              style={{
                position: "absolute",
                top: "15px",
                right: "15px",
                background: "none",
                border: "none",
                fontSize: "24px",
                cursor: "pointer",
                color: "#6c757d",
                fontWeight: "500"
              }}
            >
              ×
            </button>
            
            <div style={{ padding: "2rem" }}>
              <h2 style={{ 
                color: "#2d3748", 
                fontSize: "2rem", 
                fontWeight: "700", 
                marginBottom: "2rem", 
                textAlign: "center" 
              }}>
                Fund Request Details
              </h2>
              
              <div className="detail-box" style={{
                background: "white",
                borderRadius: "6px",
                padding: "2rem",
                marginBottom: "1.5rem",
                border: "1px solid #e2e8f0"
              }}>
                <p style={{
                  margin: "15px 0",
                  fontSize: "0.8rem",
                  lineHeight: "1.6",
                  display: "flex",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "8px"
                }}>
                  <strong style={{
                    color: "#2d3748",
                    fontWeight: "600",
                    minWidth: "100px",
                    fontSize: "0.9rem"
                  }}>
                    Requester:
                  </strong>
                  {selectedRequest.requesterName}
                </p>

                <p style={{
                  margin: "15px 0",
                  fontSize: "0.8rem",
                  lineHeight: "1.6",
                  display: "flex",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "8px"
                }}>
                  <strong style={{
                    color: "#2d3748",
                    fontWeight: "600",
                    minWidth: "100px",
                    fontSize: "0.9rem"
                  }}>
                    Date:
                  </strong>
                  {new Date(selectedRequest.createdAt).toLocaleDateString()}
                </p>

                <p style={{
                  margin: "15px 0",
                  fontSize: "0.8rem",
                  lineHeight: "1.6",
                  display: "flex",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "8px"
                }}>
                  <strong style={{
                    color: "#2d3748",
                    fontWeight: "600",
                    minWidth: "100px",
                    fontSize: "0.9rem"
                  }}>
                    Amount:
                  </strong>
                  Rp {selectedRequest.fundAmount.toLocaleString()}
                </p>

                <p style={{
                  margin: "15px 0",
                  fontSize: "0.8rem",
                  lineHeight: "1.6",
                  display: "flex",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "8px"
                }}>
                  <strong style={{
                    color: "#2d3748",
                    fontWeight: "600",
                    minWidth: "100px",
                    fontSize: "0.9rem"
                  }}>
                    Status:
                  </strong>
                  <span className={`status-badge ${selectedRequest.status}`} style={{
                    padding: "6px 12px",
                    borderRadius: "16px",
                    textTransform: "capitalize",
                    fontWeight: "600",
                    fontSize: "0.5rem",
                    letterSpacing: "0.5px",
                    backgroundColor: selectedRequest.status === "pending" ? "#fff3cd" : 
                                   selectedRequest.status === "approved" ? "#d4edda" : "#f8d7da",
                    color: selectedRequest.status === "pending" ? "#856404" : 
                           selectedRequest.status === "approved" ? "#155724" : "#721c24",
                    border: selectedRequest.status === "pending" ? "1px solid #ffeaa7" : 
                            selectedRequest.status === "approved" ? "1px solid #c3e6cb" : "1px solid #f5c6cb"
                  }}>
                    {selectedRequest.status}
                  </span>
                </p>

                <p style={{
                  margin: "15px 0",
                  fontSize: "0.8rem",
                  lineHeight: "1.6",
                  display: "flex",
                  alignItems: "flex-start",
                  flexWrap: "wrap",
                  gap: "8px"
                }}>
                  <strong style={{
                    color: "#2d3748",
                    fontWeight: "600",
                    minWidth: "100px",
                    fontSize: "0.9rem"
                  }}>
                    Description:
                  </strong>
                  <span style={{ flex: 1 }}>
                    {selectedRequest.description || "No description provided."}
                  </span>
                </p>

                {selectedRequest.notes && (
                  <p style={{
                    margin: "15px 0",
                    fontSize: "0.8rem",
                    lineHeight: "1.6",
                    display: "flex",
                    alignItems: "flex-start",
                    flexWrap: "wrap",
                    gap: "8px"
                  }}>
                    <strong style={{
                      color: "#2d3748",
                      fontWeight: "600",
                      minWidth: "100px",
                      fontSize: "0.9rem"
                    }}>
                      Notes:
                    </strong>
                    <span style={{ flex: 1 }}>{selectedRequest.notes}</span>
                  </p>
                )}
              </div>

              {isOwner && selectedRequest.status === "pending" && (
                <div className="action-buttons" style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: "1.5rem",
                  margin: "1rem 0"
                }}>
                  <button 
                    onClick={() => handleApprove(selectedRequest.requestId)}
                    className="approve-button"
                    style={{
                      padding: "12px 32px",
                      border: "none",
                      borderRadius: "20px",
                      fontSize: "0.7rem",
                      fontWeight: "600",
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                      boxShadow: "0 2px 6px rgba(0, 0, 0, 0.08)",
                      backgroundColor: "#173782",
                      color: "white"
                    }}
                  >
                    Approve
                  </button>
                  <button 
                    onClick={() => handleReject(selectedRequest.requestId)}
                    className="decline-button"
                    style={{
                      padding: "12px 32px",
                      border: "none",
                      borderRadius: "20px",
                      fontSize: "0.7rem",
                      fontWeight: "600",
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                      boxShadow: "0 2px 6px rgba(0, 0, 0, 0.08)",
                      backgroundColor: "white",
                      color: "#173782"
                    }}
                  >
                    Decline
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetPlanDetailsPage;