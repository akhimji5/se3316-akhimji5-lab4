import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './PrivacyPolicy.css';
import { useNavigate } from 'react-router-dom';

function PrivacyPolicy() {

    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('name');
        localStorage.removeItem('userId');

        navigate('/');
    };

    return (
        <div className="privacy-policy-container">
            <h1>RealmOfHeroes: Security and Privacy Policy</h1>

            <p></p>
            <section className="policy-section">
                <h3>Introduction</h3>
                <p>At RealmOfHeroes, safeguarding the security and privacy of our users is paramount. This policy delineates our practices concerning the gathering, utilization, and safeguarding of personal information.</p>
                <br></br>
            </section>

            <section className="policy-section">
                <h3>Information Collection</h3>
                <ul>
                    <li>We collect essential information such as email addresses, nicknames, and encrypted passwords during the account creation process.</li>
                    <li>For the purpose of enhancing user experience, we may gather usage data, including search queries and interactions with lists.</li>
                </ul>
                <br></br>
            </section>

            <section className="policy-section">
                <h3>Use of Information</h3>
                <ul>
                    <li>Collected information is employed for account setup, authentication, and personalization of the application.</li>
                    <li>Email addresses may be used for communication purposes, such as password recovery and crucial application updates.</li>
                </ul>
                <br></br>
            </section>

            <section className="policy-section">
                <h3>Data Protection</h3>
                <ul>
                    <li>All personal information is securely stored and accessed only by authorized personnel.</li>
                    <li>We implement industry-standard encryption and security measures to safeguard data against unauthorized access.</li>
                </ul>
                <br></br>
            </section>

            <section className="policy-section">
                <h3>User Rights</h3>
                <ul>
                    <li>Users have the right to access their personal information, request corrections, or delete their accounts.</li>
                    <li>Opting out of non-essential communications is an option available to users.</li>
                </ul>
                <br></br>
            </section>

            <section className="policy-section">
                <h3>Updates to Policy</h3>
                <p>RealmOfHeroes reserves the right to update this policy, and users will be promptly notified of any substantial changes.</p>
                <br></br>
            </section>

            <section className="policy-section">
                <h3>Contact</h3>
                <p>For any inquiries regarding this policy, please feel free to reach out to our dedicated support team.</p>
                <br></br>
            </section>

            <section className="policy-section">
                <h3>DMCA and Takedown Policy</h3>
                <p>
                    At RealmOfHeroes, we respect the intellectual property rights of others and anticipate the same from our users. We adhere to the Digital Millennium Copyright Act (DMCA) and offer a streamlined process for submitting takedown notices.
                </p>
                <ul>
                    <li>Users or rights holders who believe their content has been infringed may submit a DMCA takedown notice.</li>
                    <li>Upon receiving a valid notice, we will promptly remove or disable access to the allegedly infringing material.</li>
                    <li>We provide a counter-notification process for users who believe their content was erroneously removed due to a mistake or misidentification.</li>
                </ul>
                <p>
                    For detailed information on the procedure or to file a notice, please contact our DMCA agent.
                </p>
                <br></br>
            </section>

            <button onClick={handleLogout} className="button-blue">Back to Home</button>
        </div>
    );
}

export default PrivacyPolicy;
