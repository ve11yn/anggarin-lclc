import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../contexts/userContext";
import "../css/profile.css";
import Navigation2 from "./navigation2";
import { Pencil, Copy, Save, X } from "lucide-react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../main"; // adjust path as needed
import Navigation3 from './navigation3';

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { state, updateUser } = useContext(UserContext);
  const [formData, setFormData] = useState({
    id: state.uid,
    name: state.name,
    email: state.email,
    phone: state.phone,
    location: state.location,
    organization: state.organization,
    department: state.department,
    position: state.position,
    description: state.description,
  });
  const [editData, setEditData] = useState({ ...formData });
  const [editing, setEditing] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      if (!state?.uid) return;
      try {
        const docRef = doc(db, "users", state.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setFormData(data as any);
          setEditData(data as any);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    fetchUser();
  }, [state?.uid]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setEditData({ ...editData, [name]: value });
  };

  const handleSave = async () => {
    const success = await updateUser(editData);
    if (success) {
      setFormData({ ...editData });
      setEditing(false);
    } else {
      alert("Failed to save changes.");
    }
  };

  const handleCancel = () => {
    setEditData({ ...formData });
    setEditing(false);
  };

  const handleEdit = () => setEditing(true);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const fileURL = URL.createObjectURL(e.target.files[0]);
      setProfileImage(fileURL);
    }
  };

  const copyIdToClipboard = () => {
    navigator.clipboard.writeText(formData.id).then(() => {
      alert("ID copied to clipboard!");
    });
  };

  return (
    <>
      <Navigation3 />
      <div className={`profile-container ${editing ? "editing-padding" : ""}`}>
        <Navigation2 />
        <div className="profile-box">

          {/* Name section - consistent styling */}
          <div className="profile-name-section">
            <div className="profile-name">{formData.name}</div>
          </div>

          {/* ID section - only shown when not editing */}
          {!editing && (
            <div className="profile-id">
              <span>ID: {formData.id}</span>
              <Copy
                size={18}
                style={{ cursor: "pointer", marginLeft: "8px" }}
                onClick={copyIdToClipboard}
              />
            </div>
          )}

          <div className="profile-info">
            {[
              { label: "Email", name: "email" },
              { label: "Phone Number", name: "phone" },
              { label: "Location", name: "location" },
              { label: "Organization / Institution", name: "organization" },
              { label: "Department", name: "department" },
              { label: "Position", name: "position" },
            ].map(({ label, name }) => (
              <div className="profile-item" key={name}>
                <label className="profile-label">{label}</label>
                {editing ? (
                  <input
                    type="text"
                    name={name}
                    value={(editData as any)[name] || ""}
                    onChange={handleChange}
                    className="profile-input"
                    placeholder={`Enter your ${label.toLowerCase()}`}
                  />
                ) : (
                  <div className="profile-value">
                    {(formData as any)[name] || "Not specified"}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Buttons inside profile-box when editing */}
          {editing && (
            <div className="profile-buttons">
              <button onClick={handleSave} className="save-btn">
                <Save size={18} style={{ marginRight: "8px" }} />
                Save
              </button>
              <button onClick={handleCancel} className="cancel-btn">
                <X size={18} style={{ marginRight: "8px" }} />
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* Floating edit button */}
        {!editing && (
          <button className="floating-edit-button" onClick={handleEdit}>
            <Pencil size={18} style={{ marginRight: "8px" }} />
            Edit Profile
          </button>
        )}
      </div>
    </>
  );
};

export default Profile;