import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {
  createBrowserRouter,
  RouterProvider,
} from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import Login from './Login.jsx'
import Register from './Register.jsx'
import User from './User.jsx'

const router = createBrowserRouter([
  {
    path: "/",
    loader: async () => await SwapApi.getAllUsers(),
    element: <App />,
  },
  {
    path: "/auth/login",
    element: <Login />
  },
  {
    path: "/auth/register",
    element: <Register />
  },
  {
    path: "/users/:username",
    loader: async ({ params }) => await SwapApi.getUser(params.username),
    element: <User />
  }
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
