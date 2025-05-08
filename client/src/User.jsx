import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router'
import FundAccount from './FundAccount.jsx'
import SendFunds from './SendFunds.jsx'
import SwapApi from './api.js'

function User() {

  const { username } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activePanel, setActivePanel] = useState(null)

  const getUser = async () => {
    setLoading(true);
    const userData = await SwapApi.getUser(username);
    setUser(userData);
    setLoading(false);
  };

  useEffect(() => {
    getUser();
  }, [username]);

  const handleLogout = () => {
    SwapApi.logout();
    navigate("/auth/login");
  };

  return (
    <>
      {loading && <h2>Loading...</h2>}
      {!loading && (
        <>
          {user.accountBalance &&
            <button onClick={() => setActivePanel("sendFunds")}>Send Funds</button>
          }
          <button onClick={handleLogout}>Log Out</button>
          <h1>Username: {user.username}</h1>
          <h2>Cash Account Balance: ${user.accountBalance ? user.accountBalance : "0.00"}</h2>
          {!user.accountBalance && <FundAccount user={user} getUser={getUser} />}
          <h2>Assets</h2>
          {user.assets.length ? (
            <ul>
              {user.assets.map(asset => (
                <li>
                  <strong>{asset.assetSymbol}</strong>: {asset.assetQuantity} {asset.assetName}
                </li>
              ))}
            </ul>
          ) : "you have not purchased any assets"}
          {activePanel === "sendFunds" && (
            <SendFunds
              username={username}
              onSubmit={async (username, formData) => {
                const { success } = await SwapApi.sendFunds(username, formData);
                setActivePanel(null);
                if (success) await getUser();
              }}
              onCancel={() => setActivePanel(null)}
            />
          )}
        </>
      )}
    </>
  )
}

export default User;
