import React, { useState } from 'react';
import axios from 'axios';
import './Signup.css'; 
import './Login.css';
import { useNavigate } from 'react-router-dom'; 

function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate(); 

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage('');

    try {
      const response = await axios.post('http://localhost:5000/user/signup', {
        name,
        email,
        password,
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if(response.data.status === "PENDING") {
        alert('Signup Successful!')
      } else if(response.data.status === "FAILED") {
        setErrorMessage(response.data.message || 'Signup failed');
      } else {
        console.log(response.data.message);
      }
    } catch (error) {
      setErrorMessage('Error during signup: ' + error.message);
    }
  };

  const navigateToLogin = () => {
    navigate('/signin'); 
  };

  const navigateBack = () => {
    navigate('/');
  };

  return (
    <div className="signup-container">
      <form onSubmit={handleSubmit} className="signup-form">
        <h1>Signup</h1>
        {errorMessage && <p className="signup-error">{errorMessage}</p>}
        <input className="input" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" required />
        <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
        <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required />
        <button type="submit">Sign Up</button>
        <p className="signup-text">Already have an account? Click Login!</p>
        <button onClick={navigateToLogin} className="signup-button">Login</button>
        <button onClick={navigateBack} className="back-button">Back</button>
      </form>
    </div>
  );
}

export default Signup;
