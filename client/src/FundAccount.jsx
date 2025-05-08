import SwapApi from './api.js';

function FundAccount({ user, getUser }) {

  const handleFund = async () => {
    await SwapApi.fundAccount(user.username);
    await getUser();
  };

  return (
    <div className="card">
      <p className="fund-account-msg">
      You have $0. Click "Fund Account" to top up your virtual balance.
      </p>
      <button onClick={handleFund}>Fund Account</button>
    </div>
  )
}

export default FundAccount
