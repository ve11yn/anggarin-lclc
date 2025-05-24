import { Link } from "react-router-dom";
import logo from "../assets/anggarin-blue.jpg";
import "../css/navigation1.css";

const Navigation1 = () => {
    return (
        <div className="navigation1">
            <div className="nav-inner">
                <div>
                    <img src={logo} alt="logo" width="200px" />
                </div>

                <div className="nav-links">
                    <Link to="/register" className="nav-link">Register</Link>
                    <Link to="/login" className="nav-link">Login</Link>
                </div>
            </div>
        </div>
    );
}

export default Navigation1;  