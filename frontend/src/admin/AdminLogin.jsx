import { useState } from 'react';

export default function AdminLogin() {
  const [token, setToken] = useState('');
  function handleLogin() {
    localStorage.setItem('admin-token', token);
    window.location.href = '/admin';
  }
  return (
    <div className="max-w-sm mx-auto mt-20">
      <h1 className="text-xl mb-4">Admin Login</h1>
      <input
        type="text"
        className="border p-2 w-full mb-2"
        placeholder="Token"
        value={token}
        onChange={(e) => setToken(e.target.value)}
      />
      <button onClick={handleLogin} className="bg-blue-600 text-white px-4 py-2">
        Login
      </button>
    </div>
  );
}
