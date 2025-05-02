import React from "react";
import { Link } from "react-router-dom";

const HomePage = () => {
    return (
        <div className="home-page">
            <h1>Welcome to Talk 2 Me</h1>
            <p>Your one-stop solution for audio processing.</p>
            <div className="navigation-options">
                <Link to="/listening">
                    <button>Go to Listening Page</button>
                </Link>
                <Link to="/project-overview">
                    <button>Go to Project Overview</button>
                </Link>
            </div>
        </div>
    );
};

export default HomePage;