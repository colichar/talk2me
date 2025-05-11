import React from "react";
import { ReactComponent as Logo } from '../assets/logo_status.svg';

const ProjectOverviewPage = () => {
    return (
        <div className="centered-container">
            <Logo style={{ width: '15%', height: 'auto' }} />
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