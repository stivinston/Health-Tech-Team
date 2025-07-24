import React, { useState } from 'react';

interface LoginProps {
  onLogin: (summaryId: string) => void;
  error?: string;
}

const Login: React.FC<LoginProps> = ({ onLogin, error }) => {
  const [summaryId, setSummaryId] = useState('');
  const [localError, setLocalError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!summaryId.trim()) {
      setLocalError('Please enter a valid Summary ID');
      return;
    }
    onLogin(summaryId);
  };

  const displayError = error || localError;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">Health App Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="summaryId">
              Summary ID
            </label>
            <input
              id="summaryId"
              type="text"
              value={summaryId}
              onChange={(e) => setSummaryId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your patient ID"
            />
            {displayError && <p className="text-red-500 text-xs mt-1">{displayError}</p>}
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors"
          >
            Connect
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
