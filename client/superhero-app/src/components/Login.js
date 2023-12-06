import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage(''); 

    try {
      const response = await axios.post('http://localhost:5000/user/signin', {
        email,
        password,
      });

      if (response.data.status === "SUCCESS") {
        localStorage.setItem('name', response.data.data.name);
        localStorage.setItem('userId', response.data.data._id);
        localStorage.setItem('email', response.data.data.email);
        localStorage.setItem('isAdmin', response.data.data.isAdmin);

        if (response.data.data.isAdmin) {
          navigate('/AdminPage');
        } else if (response.data.data.isDisabled) {
          navigate('/DisabledPage');
        } else {
          navigate('/herofinder');
        }
      } else {
        setErrorMessage(response.data.message || 'Login failed');
      }
    } catch (error) {
      setErrorMessage('Error during login: ' + error.message);
    }
  };

  const navigateToSignUp = () => {
    navigate('/signup');
  };

  const navigateBack = () => {
    navigate('/');
  };

  return (
    <div className="login-container">
        <form onSubmit={handleSubmit} className="login-form">
            <h1>Login</h1>
            {errorMessage && <p className="login-error">{errorMessage}</p>}
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required />
            <button type="submit">Login</button>
            <p className="signup-text">Don't have an account yet? Click Sign Up!</p>
            <button onClick={navigateToSignUp} className="signup-button">Sign Up</button>
            <button onClick={navigateBack} className="back-button">Back</button>
        </form>
    </div>
  );
}

export default Login;
