import React from 'react';
import { Link } from 'react-router-dom';
import './DisabledPage.css';

function DisabledPage() {
    return (
        <div className="disabled-page-container">
            <h1>Your account is disabled!</h1>
            <Link to="/" className="home-link">Return to Home</Link>
        </div>
    );
}

export default DisabledPage;
