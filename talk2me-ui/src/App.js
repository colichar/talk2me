import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import HomePage from "./components/HomePage";
import ListeningPage from "./components/ListeningPage";
import ProjectOverviewPage from "./components/ProjectOverviewPage";
import "./styles/App.css";

const App = () => {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/listening" element={<ListeningPage />} />
          <Route path="/project-overview" element={<ProjectOverviewPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;