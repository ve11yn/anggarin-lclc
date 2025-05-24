import { useParams } from "react-router-dom";
import { useFundRequests } from "../contexts/fundRequestContext";
import { useUser } from "../contexts/userContext";
import { useState } from "react";
import Navigation2 from "./navigation2";


const CreateFundRequest = () => {
    const { planId } = useParams();
  const { createRequest } = useFundRequests();
  const { state: userState } = useUser();
  const [formData, setFormData] = useState({
    amount: 0,
    description: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!planId || !userState.uid) return;

    try {
      await createRequest({
        planId,
        requesterId: userState.uid,
        requesterName: userState.name || 'Anonymous',
        fundAmount: formData.amount,
        description: formData.description
      });
      alert('Request created successfully!');
      setFormData({ amount: 0, description: '' });
    } catch (error) {
      console.error('Error creating request:', error);
      alert('Failed to create request');
    }
  };

  return (
    <div className="create-request-container">
      <Navigation2 />
      <h2>Create New Fund Request</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="number"
          value={formData.amount}
          onChange={(e) => setFormData({...formData, amount: Number(e.target.value)})}
          placeholder="Amount"
          required
        />
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          placeholder="Purpose of request"
          required
        />
        <button type="submit">Submit Request</button>
      </form>
    </div>
    );
}

export default CreateFundRequest;