import SwapApi from './api.js';

function FundAccount({ user, getUser }) {

  const handleFund = async () => {
    await SwapApi.fundAccount(user.username);
    await getUser();
  };

  return (
    <div className="card">
      <p className="fund-account-msg">
        Looks like your account balance is $0!<br />
        You've either used up all your initial funds, or you've just opened a new account.<br />
        Either way, top up with some fresh fake liquidity by hitting the "Fund Account" button below.
      </p>
      <button onClick={handleFund}>
        Fund Account
      </button>
    </div>
  )
}

export default FundAccount
