import { useState } from 'react'

function SendFunds({ username, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    usernameReceiving: "",
    amount: ""
  });

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    await onSubmit(username, formData);
  }

  return (
    <>
      <h2>Send Funds</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="usernameReceiving">Recipient Username: </label>
          <input
            type="text"
            id="usernameReceiving"
            name="usernameReceiving"
            value={formData.usernameReceiving}
            placeholder="username"
            onChange={handleChange}
          />
        </div>
        <div>
          <label htmlFor="amount">Amount $: </label>
          <input
            type="text"
            id="amount"
            name="amount"
            value={formData.amount}
            placeholder="0.00"
            onChange={handleChange}
          />
        </div>
        <button type="submit">Send Funds</button>
        <button type="button" onClick={onCancel}>Cancel</button>
      </form>
    </>
  )
}

export default SendFunds;
