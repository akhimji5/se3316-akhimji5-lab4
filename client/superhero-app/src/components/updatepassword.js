import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; 


function UpdatePassword() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const userId = localStorage.getItem('userId');

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/user/changePassword', {
        userId,
        currentPassword,
        newPassword
      });
      alert(response.data.message);
      handleBack();
    } catch (error) {
      alert(error.response?.data?.message || 'Error updating password');
    }
  };
  const handleBack = () => {
    navigate('/HeroFinder'); 
  };

  return (
    <div>
      <h2>Change Password</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          placeholder="Current Password"
          required
        />
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="New Password"
          required
        />
        <button type="submit">Update Password</button>
      </form>
      <button onClick={handleBack} className="back-button">Back</button>
    </div>
  );
}

export default UpdatePassword;
