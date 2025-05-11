import React from "react";
import logo from "../assets/logo_status.svg";

const ProjectOverviewPage = () => {
    return (
        <div className="centered-container">
            <img src={logo} alt="Status Logo" className="logo" loading="lazy" />
            <h1 className="heading-primary">Project Overview</h1>
            <p className="text-secondary">This is where you can manage your projects.</p>
            <div className="project-list">
                <h2>Your Projects</h2>
                {/* List of projects will go here */}
            </div>
        </div>
    );
};

export default ProjectOverviewPage; 