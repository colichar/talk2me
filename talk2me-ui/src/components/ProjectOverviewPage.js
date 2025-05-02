import React from "react";

const ProjectOverviewPage = () => {
    return (
        <div className="project-overview">
            <h1>Project Overview</h1>
            <p>This is where you can manage your projects.</p>
            <div className="project-list">
                <h2>Your Projects</h2>
                {/* List of projects will go here */}
            </div>
        </div>
    );
};

export default ProjectOverviewPage;