import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useFundRequests } from "../contexts/fundRequestContext";
import { FundRequest } from "../contexts/fundRequestContext";
import "../css/fundRequestDetail.css";
import Navigation3 from "./navigation3";
import Navigation2 from "./navigation2";

const FundRequestDetail = () => {
  const { requestId } = useParams<{ requestId: string }>();
  const navigate = useNavigate();
  const { state: { requests }, updateRequestStatus, getRequest } = useFundRequests();
  const [request, setRequest] = useState<FundRequest | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequest = async () => {
      if (!requestId) {
        setLoading(false);
        return;
      }

      try {
        // First try to find in local state
        let req = requests.find(r => r.requestId === requestId);
        
        // If not found locally, fetch from database
        if (!req) {
          req = await getRequest(requestId);
        }
        
        setRequest(req);
      } catch (error) {
        console.error("Error fetching request:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRequest();
  }, [requestId, requests, getRequest]);

  const handleStatusChange = async (status: "approved" | "rejected") => {
    if (!request) return;

    try {
      await updateRequestStatus(request.requestId, status);
      setRequest({ ...request, status }); // locally update state
      alert(`Request ${status === "approved" ? "approved" : "declined"} successfully.`);
    } catch (error) {
      console.error(`Failed to update status:`, error);
      alert("Failed to update status.");
    }
  };

  if (loading) return <div>Loading...</div>;
  
  if (!request) return (
    <div className="fund-request-detail">
      <Navigation3 />
      <Navigation2 />
      <div className="fund-request-content">
        <h2>Request not found</h2>
        <button onClick={() => navigate(-1)}>Go Back</button>
      </div>
    </div>
  );

  return (
    <div className="fund-request-detail">
      <Navigation3 />
      <Navigation2 />
      <div className="fund-request-content">
        <button onClick={() => navigate(-1)} className="back-button">←</button>

        <div className="detail-box">
          <p><strong>Requester:</strong> {request.requesterName}</p>
          <p><strong>Date:</strong> {new Date(request.createdAt).toLocaleDateString()}</p>
          <p><strong>Amount:</strong> Rp {request.fundAmount.toLocaleString()}</p>
          <p><strong>Status:</strong> <span className={`status-badge ${request.status}`}>{request.status}</span></p>
          <p><strong>Description:</strong> {request.description || "No description provided."}</p>
          {request.notes && <p><strong>Notes:</strong> {request.notes}</p>}
        </div>
        {request.status === "pending" && (
          <div className="action-buttons">
            <button onClick={() => handleStatusChange("approved")} className="approve-button">Approve</button>
            <button onClick={() => handleStatusChange("rejected")} className="decline-button">Decline</button>
          </div>
        )}
        
      </div>
    </div>
  );
};

export default FundRequestDetail;