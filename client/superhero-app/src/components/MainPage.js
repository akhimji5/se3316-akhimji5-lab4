import React from 'react';
import { Link } from 'react-router-dom';
import './MainPage.css';

function MainPage() {

    return (
        <div className="full-page-background">
            <div className="main-container">
                <h1>
                    <div className="waviy">
                        <b>RealmOfHeroes</b>
                    </div>
                </h1>
                <p className="app-description">
                    Want info on ALL your favourite heroes?? Look no further!
                </p>
                <p className="gen-text">Choose an option:</p>
                <p></p>
                <div className="link-container">
                    <Link className="main-link" to="/signin">Login</Link>
                    <span className="link-separator"> | </span>
                    <Link className="main-link" to="/signup">Sign Up</Link>
                    <p></p>
                    <p className="gen-text">Don't want to make an account? No worries try it out</p>
                    <Link className="main-link" to="/unauthusers">Here</Link>
                    <p></p>
                    <Link className="main-link" to="/privacypolicy">View Privacy Policy</Link>
                </div>
            </div>
        </div>
    );
}

export default MainPage;