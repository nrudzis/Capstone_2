import { useState } from 'react'

function BuySell({ username, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    symbol: "",
    orderType: "",
    amount: ""
  });

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }

  const handleSubmit = async e => {
    e.preventDefault();
    await onSubmit(username, formData);
  }

  return (
    <>
      <h2>Market Transaction</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="symbol">Symbol: </label>
          <input
            type="text"
            id="symbol"
            name="symbol"
            value={formData.symbol}
            placeholder="eg. AAPL or BTCUSD"
            onChange={handleChange}
          />
        </div>
        <div>
          <label htmlFor="orderType">Order type: </label>
          <select
            id="orderType"
            name="orderType"
            value={formData.orderType}
            onChange={handleChange}
          >
            <option value="">Select an order type</option>
            <option value="buy">Buy</option>
            <option value="sell">Sell</option>
          </select>
        </div>
        <div>
          <label htmlFor="amount">Amount: </label>
          <input
            type="text"
            id="amount"
            name="amount"
            value={formData.amount}
            placeholder="eg. 1000 or 0.003"
            onChange={handleChange}
          />
        </div>
        <button type="submit">Submit</button>
        <button type="button" onClick={onCancel}>Cancel</button>
      </form>
    </>
  );
}

export default BuySell;
