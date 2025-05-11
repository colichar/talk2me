import React from "react";
import { Link } from "react-router-dom";
import logo from "../assets/logo_homepage.svg";

const HomePage = () => {
    return (
        <div className="centered-container home-page">
            <img src={logo} alt="Talk 2 Me Logo" className="logo" loading="lazy" />
            <h1 className="heading-primary">Welcome to Talk 2 Me</h1>
            <p className="text-secondary">Your personal project assistant. How may I help you?</p>
            <div className="navigation-options">
                <Link to="/listening">
                    <button className="bla">Can you take notes for us?</button>
                </Link>
                <Link to="/project-overview">
                    <button>How are our projects doing?</button>
                </Link>
            </div>
        </div>
    );
};

export default HomePage;