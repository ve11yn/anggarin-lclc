// CreateFundRequest.tsx - Fixed Version
import { useParams, useNavigate } from "react-router-dom";
import { useFundRequests } from "../contexts/fundRequestContext";
import { useUser } from "../contexts/userContext";
import { useState } from "react";
import Navigation2 from "./navigation2";
import { useBudgetPlans } from "../contexts/budgetPlanContext";

const CreateFundRequest = () => {
  const { planId } = useParams();
  const { createRequest } = useFundRequests();
  const { state: userState } = useUser();
  const { addFundRequest } = useBudgetPlans();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    amount: '',  // Changed to string to handle empty input
    description: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!planId) {
      alert('Plan ID is missing');
      return;
    }
    
    if (!userState.uid) {
      alert('Please login to create a request');
      navigate('/login');
      return;
    }
    
    if (!userState.name || userState.name.trim() === '') {
      alert('Please complete your profile with a name first');
      return;
    }
    
    const amount = parseFloat(formData.amount);
    if (!amount || amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    
    if (!formData.description.trim()) {
      alert('Please provide a description');
      return;
    }

    setIsSubmitting(true);
    
    try {
      console.log('Creating request with data:', {
        planId,
        requesterId: userState.uid,
        requesterName: userState.name,
        fundAmount: amount,
        description: formData.description.trim()
      });
      
      const requestId = await createRequest({
        planId,
        requesterId: userState.uid,
        requesterName: userState.name,
        fundAmount: amount,
        description: formData.description.trim()
      });
      
      console.log('Request created with ID:', requestId);
      
      // Add request to budget plan
      await addFundRequest(planId, requestId);
      
      alert('Request created successfully!');
      setFormData({ amount: '', description: '' });
      
      // Navigate back to plan details
      navigate(`/budgetplan/${planId}`);
      
    } catch (error) {
      console.error('Error creating request:', error);
      alert(`Failed to create request: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="create-request-container">
      <Navigation2 />
      <h2>Create New Fund Request</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Amount (Rp):</label>
          <input
            type="number"
            min="1"
            step="0.01"
            value={formData.amount}
            onChange={(e) => setFormData({...formData, amount: e.target.value})}
            placeholder="Enter amount"
            required
            disabled={isSubmitting}
          />
        </div>
        
        <div>
          <label>Description:</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            placeholder="Purpose of request"
            rows={4}
            required
            disabled={isSubmitting}
          />
        </div>
        
        <button 
          type="submit" 
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Creating...' : 'Submit Request'}
        </button>
        
        <button 
          type="button" 
          onClick={() => navigate(`/budgetplan/${planId}`)}
          disabled={isSubmitting}
        >
          Cancel
        </button>
      </form>
    </div>
  );
};

export default CreateFundRequest;