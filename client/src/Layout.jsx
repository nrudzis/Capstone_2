import { useState } from 'react'
import { Outlet } from 'react-router'
import Toast from './Toast.jsx'

function Layout() {
  const [toast, setToast] = useState({ message: null });

  const showToast = message => {
    setToast({ message });
    setTimeout(() => setToast({ message: null }), 5000);
  };

  return (
    <div style={{display: "block"}}>
      <Toast
        message={toast.message}
        onClose={() => setToast({ message: null })}
      />
      <Outlet context={{showToast}} />
    </div>
  );
}

export default Layout;
