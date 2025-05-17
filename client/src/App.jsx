import './App.css'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import { useNavigate } from 'react-router'

function App() {

  const navigate = useNavigate();

  return (
    <>
      <h1>SWAP</h1>
      <ul>
        <li style={{textAlign: "left"}}>Add virtual funds.</li>
        <li style={{textAlign: "left"}}>Send and receive funds from other users.</li>
        <li style={{textAlign: "left"}}>Buy and sell stocks and cryptocurrencies.</li>
        <li style={{textAlign: "left"}}>Visualize your transactions and portfolio.</li>
      </ul>
      <br/>
      <Box>
        <Button
          variant="contained"
          sx={{ m: 2 }}
          onClick={() => navigate("/auth/login")}
        >
          Log In
        </Button>
        <Button
          variant="contained"
          sx={{ m: 2 }}
          onClick={() => navigate("/auth/register")}
        >
          Register
        </Button>
      </Box>
    </>
  )
}

export default App
