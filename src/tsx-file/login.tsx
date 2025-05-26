import { getAuth, GoogleAuthProvider, signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserContext } from "../contexts/userContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../main";
import "../css/register-login-details.css";
import "../css/index.css";
import logo from "../assets/anggarin.png"

const Login = () => {
    const auth = getAuth();
    const navigate = useNavigate();
    const { dispatch } = useContext(UserContext);

    const [authingEmail, setAuthingEmail] = useState(false);
    const [authingGoogle, setAuthingGoogle] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const fetchUserData = async (uid: string) => {
        try {
            console.log('Firestore instance:', db); // Debug line
            
            const userDoc = await getDoc(doc(db, "users", uid));
            if (userDoc.exists()) {
                const userData = userDoc.data();
                dispatch({ 
                    type: "SET_USER", 
                    payload: { 
                        email: userData.email,
                        name: userData.name || "",
                    } 
                });
            }
        } catch (error) {
            console.error("Error fetching user data:", error);
        }
    };

    const loginWithGoogle = async () => {
        setAuthingGoogle(true);
        setError("");
        
        try {
            const response = await signInWithPopup(auth, new GoogleAuthProvider());
            const user = response.user;
            
            const userDoc = await getDoc(doc(db, "users", user.uid));
            if (userDoc.exists()) {
                const userData = userDoc.data();
                dispatch({
                    type: "SET_USER",
                    payload: {
                        uid: user.uid,
                        email: user.email || "",
                        ...userData
                    }
                });
            }
            
            navigate("/dashboard");
        } catch (error: any) {
            console.error(error);
            if (error.code === "auth/user-not-found") {
                setError("Email is not registered.");
            } else if (error.code === "auth/wrong-password") {
                setError("Incorrect password.");
            } else {
                setError(error.message);
            }
            setAuthingGoogle(false);
        }
    };

    const loginWithEmail = async () => {
        setAuthingEmail(true);
        setError("");
        
        try {
            const response = await signInWithEmailAndPassword(auth, email, password);
            const user = response.user;
            
            const userDoc = await getDoc(doc(db, "users", user.uid));
            if (userDoc.exists()) {
                const userData = userDoc.data();
                dispatch({
                    type: "SET_USER",
                    payload: {
                        uid: user.uid,
                        email: user.email || "",
                        ...userData
                    }
                });
            }
            
            navigate("/dashboard");
        } catch (error: any) {
            console.error(error);
            if (error.code === "auth/user-not-found") {
                setError("Email is not registered.");
            } else if (error.code === "auth/wrong-password") {
                setError("Incorrect password.");
            } else {
                setError(error.message);
            }
            setAuthingEmail(false);
        }
    };

    return (
        <div className="main-content2">
            <div className="auth-layout">
                {/* Left side - Branding */}
                <div className="auth-branding">
                    <div className="auth-logo">
                        <img src={logo} alt="Logo" />
                    </div>
                </div>

                {/* Right side - Login Form */}
                <div className="auth-form-wrapper">
                    <div className="login-container">
                        <h1 className="auth-title">Log in to your account</h1>
                        <div className="auth-card">
                            <button onClick={loginWithGoogle} className="login-with-google" disabled={authingGoogle}>
                                {authingGoogle ? "Signing in..." : "Sign In with Google"}
                            </button>
                            <p>or</p>
                            <div className="login-form-container">
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
                                <button onClick={loginWithEmail} disabled={authingEmail}>
                                    {authingEmail ? "Logging in..." : "Log in"}
                                </button>
                            </div>
                            {error && <p className="error-message">{error}</p>}
                            <p className="auth-link">
                                Do not have an account? <Link to="/register">Create Account</Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;