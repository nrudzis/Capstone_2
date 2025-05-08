import { useState } from 'react'
import { useNavigate, Link } from 'react-router'
import SwapApi from './api.js'

function Register() {
  const [formData, setFormData] = useState({
    username: "",
    password: ""
  });

  const navigate = useNavigate();

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const { success, username } = await SwapApi.register(formData);
    if (success) navigate(`/users/${username}`);
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="username">Username: </label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
          />
        </div>
        <div>
          <label htmlFor="password">Password: </label>
          <input
            type="password"
            id="password" 
            name="password"
            value={formData.password}
            onChange={handleChange}
          />
        </div>
        <button type="submit">Register</button>
      </form>
      <br/>
      <p>Already have an account? Click <Link to="/auth/login">here</Link> to log in.</p>
    </>
  )
}

export default Register;
