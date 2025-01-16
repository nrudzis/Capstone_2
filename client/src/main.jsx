import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {
  createBrowserRouter,
  RouterProvider,
} from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import SwapApi from './api.js'
import Register from './Register.jsx'

const router = createBrowserRouter([
  {
    path: "/",
    loader: async () => await SwapApi.getUser("james.bond.007"),
    element: <App />,
  },
  {
    path: "/register",
    element: <Register />
  }
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
