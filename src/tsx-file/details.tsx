import { getAuth } from "firebase/auth";
import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../contexts/userContext";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../main";
import "../css/register-login-details.css";
import "../css/index.css";

const Details = () => {
    const auth = getAuth();
    const navigate = useNavigate();
    const { state, dispatch } = useContext(UserContext);
    
    const [formData, setFormData] = useState({
        uid: state.uid || "",
        name: state.name || "",
        phone: state.phone || "",
        location: state.location || "",
        organization: state.organization || "",
        department: state.department || "",
        position: state.position || "",
        description: state.description || "",
        fundCount: state.fundCount || 0,
        totalFund: state.totalFund || 0,
        remainingFund: state.remainingFund || 0,
        createdAt: state.createdAt || new Date().toISOString(),
        updatedAt: state.updatedAt || "",
        budgetPlans: state.budgetPlans || [] 
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === "fundCount" || name === "totalFund" || name === "remainingFund" 
                   ? Number(value) 
                   : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        try {
            const user = auth.currentUser;
            if (user) {
                const updatedData = {
                    ...formData,
                    updatedAt: new Date().toISOString()
                };
                
                await setDoc(doc(db, "users", user.uid), updatedData, { merge: true });
                
                dispatch({
                    type: "SET_USER",
                    payload: updatedData
                });
                
                navigate("/dashboard");
            }
        } catch (error) {
            console.error("Error saving user details:", error);
        }
    };

    return (
        <div className="details-container">
            <h2>Complete your details.</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Full Name</label>
                    <input 
                        type="text" 
                        name="name" 
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />
                </div>
            
                <div className="form-group">
                    <label>Phone Number</label>
                    <input 
                        type="tel" 
                        name="phone" 
                        value={formData.phone}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Location</label>
                    <input 
                        type="text" 
                        name="location" 
                        value={formData.location}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Organization</label>
                    <input 
                        type="text" 
                        name="organization" 
                        value={formData.organization}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Department</label>
                    <input 
                        type="text" 
                        name="department" 
                        value={formData.department}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Position</label>
                    <input 
                        type="text" 
                        name="position" 
                        value={formData.position}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Description</label>
                    <input 
                        type="text" 
                        name="description" 
                        value={formData.description}
                        onChange={handleChange}
                        required
                    />
                </div>
                
                <button type="submit">Save Details</button>
            </form>
        </div>
    );
};

export default Details;