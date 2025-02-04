import { useLoaderData } from 'react-router-dom'

function User() {

  const user = useLoaderData();

  return (
    <>
      <h1>Username: {user.username}</h1>
      <h2>Account Balance: ${user.accountBalance}</h2>
    </>
  )
}

export default User;
