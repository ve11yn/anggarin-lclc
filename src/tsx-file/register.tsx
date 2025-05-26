import { createUserWithEmailAndPassword, getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserContext } from "../contexts/userContext";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../main";
import "../css/register-login-details.css";
import "../css/index.css";
import logo from "../assets/anggarin.png"

const Register = () => {
    const auth = getAuth();
    const navigate = useNavigate();
    const { dispatch } = useContext(UserContext);

    const [authingEmail, setAuthingEmail] = useState(false);
    const [authingGoogle, setAuthingGoogle] = useState(false);
    const [username, setUsername] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [birthdate, setBirthdate] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");

    const registerWithGoogle = async () => {
        setAuthingGoogle(true);
        setError("");
        
        try {
            const response = await signInWithPopup(auth, new GoogleAuthProvider());
            const user = response.user;
            
            await setDoc(doc(db, "users", user.uid), {
                uid: user.uid,
                email: user.email,
                name: user.displayName || "",
                createdAt: new Date().toISOString(),
                provider: "google"
            });

            dispatch({ 
                type: "SET_USER", 
                payload: { 
                    uid: user.uid,
                    email: user.email || "",
                    name: user.displayName || ""
                } 
            });
            
            navigate("/details");
        } catch (error: any) {
            console.error(error);
            if (error.code === "auth/email-already-in-use") {
                setError("Email already registered.");
            } else {
                setError(error.message);
            }
            setAuthingGoogle(false);
        }
    };

    const registerWithEmail = async () => {
        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (!username || !firstName || !lastName || !birthdate || !email || !password) {
            setError("Please fill in all fields");
            return;
        }

        setAuthingEmail(true);
        setError("");

        try {
            const response = await createUserWithEmailAndPassword(auth, email, password);
            const user = response.user;
            
            await setDoc(doc(db, "users", user.uid), {
                uid: user.uid,
                email: user.email,
                username: username,
                firstName: firstName,
                lastName: lastName,
                birthdate: birthdate,
                createdAt: new Date().toISOString(),
                provider: "email"
            });

            dispatch({ 
                type: "SET_USER", 
                payload: { 
                    uid: user.uid,
                    email: email,
                    username: username,
                    firstName: firstName,
                    lastName: lastName,
                } 
            });
            
            navigate("/details");
        } catch (error: any) {
            console.error(error);
            setError(error.message);
            setAuthingEmail(false);
        }
    };

    return (
        <div className="main-content2">
            <div className="auth-layout">
                {/* Left side - Branding */}
                <div className="auth-branding">
                    <div className="auth-logo">
                        <img src={logo} alt="Anggarin Logo" />
                    </div>
                    <div className="auth-tagline">
                        <h2>Join for free.</h2>
                        <p>Tracking Every <span className="tagline-highlight">Rupiah</span>,</p>
                        <p>Securing Every <span className="tagline-italic">Purpose</span>.</p>
                    </div>
                </div>

                {/* Right side - Register Form */}
                <div className="auth-form-wrapper">
                    <div className="register-container">
                        <h1 className="auth-title">Create New Account</h1>
                        <div className="auth-card">
                            <button onClick={registerWithGoogle} className="login-with-google" disabled={authingGoogle}>
                                {authingGoogle ? "Registering..." : "Register with Google"}
                            </button>
                            <p>or</p>
                            <div className="register-form-container">
                                <input 
                                    type="text"
                                    placeholder="Username"
                                    value={username}
                                    onChange={(e) => { setUsername(e.target.value); setError(""); }}
                                />
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <input 
                                        type="text"
                                        placeholder="First Name"
                                        value={firstName}
                                        onChange={(e) => { setFirstName(e.target.value); setError(""); }}
                                        style={{ flex: 1 }}
                                    />
                                    <input 
                                        type="text"
                                        placeholder="Last Name"
                                        value={lastName}
                                        onChange={(e) => { setLastName(e.target.value); setError(""); }}
                                        style={{ flex: 1 }}
                                    />
                                </div>
                                <input 
                                    type="date"
                                    placeholder="Birthdate"
                                    value={birthdate}
                                    onChange={(e) => { setBirthdate(e.target.value); setError(""); }}
                                />
                                <input 
                                    type="email"
                                    placeholder="Email"
                                    value={email}
                                    onChange={(e) => { setEmail(e.target.value); setError(""); }}
                                />
                                <input
                                    type="password"
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => { setPassword(e.target.value); setError(""); }}
                                />
                                <input
                                    type="password"
                                    placeholder="Confirm Password"
                                    value={confirmPassword}
                                    onChange={(e) => { setConfirmPassword(e.target.value); setError(""); }}
                                />
                                <button onClick={registerWithEmail} disabled={authingEmail}>
                                    {authingEmail ? "Registering..." : "Register"}
                                </button>
                            </div>
                            {error && <p className="error-message">{error}</p>}
                            <p className="auth-link">
                                Already have an account? <Link to="/login">Login</Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;