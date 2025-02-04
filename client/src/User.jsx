import { useLoaderData } from 'react-router-dom'
import FundAccount from './FundAccount.jsx'

function User() {

  const user = useLoaderData();

  return (
    <>
      <h1>Username: {user.username}</h1>
      <h2>Account Balance: ${user.accountBalance ? user.accountBalance : "0.00"}</h2>
      {!user.accountBalance && <FundAccount />}
    </>
  )
}

export default User;
