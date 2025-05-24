import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../contexts/userContext";
import "../css/profile.css";


const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { state, updateUser } = useContext(UserContext);  // Access the updateUser function
  // Initial user data
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

  // Data being edited
  const [editData, setEditData] = useState({ ...formData });
  const [editing, setEditing] = useState(false);

  // Update the form field when user types
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setEditData({ ...editData, [name]: value });
  };

  // Save the changes
  const handleSave = async () => {
    const success = await updateUser(editData); // Call the context function to update the profile

    if (success) {
      setFormData({ ...editData });
      setEditing(false); // Exit editing mode
    } else {
      alert('Failed to save changes.');
    }
  };

  // Cancel editing
  const handleCancel = () => {
    setEditData({ ...formData });
    setEditing(false);
  };

  // Enter edit mode
  const handleEdit = () => setEditing(true);

  const [profileImage, setProfileImage] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const fileURL = URL.createObjectURL(e.target.files[0]);
      setProfileImage(fileURL);
    }
  };

  return (
    <div className="profile-container">
      <button
        className="profile-back-button"
        onClick={() => navigate("/dashboard")}
      >
        ←
      </button>

      <div className="profile-box">
        {/* Left column with picture and ID */}
        <div className="profile-left">
          <div>
            <div className="profile-picture">
              {profileImage ? <img src={profileImage} alt="Profile" /> : null}
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              id="profileImageInput"
            />
            <label htmlFor="profileImageInput" className="profile-picture-button">
              Change Picture
            </label>
          </div>
          <p className="profile-id">ID: {formData.id}</p>
        </div>

        {/* Right column form area */}
        <form onSubmit={(e) => e.preventDefault()} className="profile-right">
          {[
            "name",
            "password",
            "email",
            "phone",
            "location",
            "organization",
            "department",
            "position",
          ].map((field) => (
            <div className="profile-field" key={field}>
              <label className="profile-label">
                {field.charAt(0).toUpperCase() + field.slice(1)}
              </label>
              <input
                className="profile-input"
                type={field === "password" ? "password" : "text"}
                name={field}
                value={editData[field as keyof typeof editData]}
                onChange={handleChange}
                disabled={!editing}
              />
            </div>
          ))}

          {/* Description spans full width */}
          <div className="profile-field" style={{ gridColumn: "span 2" }}>
            <label className="profile-label">Description</label>
            <textarea
              className="profile-textarea"
              name="description"
              value={editData.description}
              onChange={handleChange}
              disabled={!editing}
            />
          </div>

          {/* Bottom-right buttons */}
          <div className="profile-buttons">
            {!editing ? (
              <button
                type="button"
                className="profile-button"
                onClick={handleEdit}
              >
                Edit
              </button>
            ) : (
              <>
                <button
                  type="button"
                  className="profile-button cancel"
                  onClick={handleCancel}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="profile-button"
                  onClick={handleSave}
                >
                  Save
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
