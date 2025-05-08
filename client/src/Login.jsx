import { useState } from 'react'
import { useNavigate, Link } from 'react-router'
import SwapApi from './api.js'

function Login() {
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
    const { success, username } = await SwapApi.login(formData);
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
        <button type="submit">Log In</button>
      </form>
      <br/>
      <p>Don't have an account? Click <Link to="/auth/register">here</Link> to register.</p>
    </>
  )
}

export default Login;
