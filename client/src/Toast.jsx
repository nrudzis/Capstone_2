function Toast({ message, onClose }) {
  if (!message) return null;

  return (
    <>
      <span>{message}</span>
      <button onClick={onClose}>✖</button>
    </>
  );
}

export default Toast;
