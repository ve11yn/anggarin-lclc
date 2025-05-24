import { getAuth, GoogleAuthProvider, signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserContext } from "../contexts/userContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../main";
import "../css/register-login-details.css";
import "../css/index.css";


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
        <div className="main-content">
            <div className="login-container">
                <h1 className="auth-title">Login to Anggar.in</h1>
                <div className="auth-card">
                    <button onClick={loginWithGoogle} className="login-with-google">
                        {authingGoogle ? "Logging in..." : "Log in with Google"}
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
                        <button onClick={loginWithEmail}>
                            {authingEmail ? "Logging in..." : "Log in"}
                        </button>
                    </div>
                    {error && <p className="error-message">{error}</p>}
                    <p className="auth-link"><Link to="/register">Don't have an account? Create one here.</Link></p>
                </div>
            </div>
        </div>
    );
};

export default Login;