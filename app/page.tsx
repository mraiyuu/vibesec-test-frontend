"use client";
import React, { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle, Loader } from 'lucide-react';

const CodeExchange = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const authenticateUser = async () => {
      try {
        // Extract code from URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const codeParam = urlParams.get('code');

        console.log("Starting authentication process");

        if (!codeParam) {
          setAuthError('No authentication code found in URL');
          return;
        }

        // Decode and parse the code parameter
        const decodedCode = decodeURIComponent(codeParam);
        const codeData = JSON.parse(decodedCode);

        // Extract the actual code from the data structure
        const actualCode = JSON.parse(atob(codeData.data)).code;

        console.log('Exchanging code:', actualCode);
        console.log("Calling backend for authentication");

        // Call backend API to exchange code for session tokens
        const response = await fetch('https://backend.vibesec.app/api/v2/user/exchangeCode', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include', // Ensures cookies are handled properly
          body: JSON.stringify({
            code: actualCode
          })
        });

        console.log('Backend response:', response);

        if (response.ok) {
          const data = await response.json();
          console.log('Authentication successful, cookies should be set');

          // Set authenticated state - this will trigger UI render
          setIsAuthenticated(true);

          // Redirect to dashboard after brief delay
          setTimeout(() => {
            window.location.href = '/dashboard';
          }, 1000);

        } else {
          const errorData = await response.json();
          console.error('Authentication failed:', errorData);
          setAuthError(errorData.error || 'Authentication failed');
        }

      } catch (error) {
        console.error('Authentication error:', error);
        setAuthError('Authentication failed. Please try again.');
      }
    };

    // Start authentication immediately when component mounts
    authenticateUser();
  }, []);

  // Don't render any UI until we get a response from backend
  if (!isAuthenticated && !authError) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-16 h-16 animate-spin text-blue-400 mx-auto mb-4" />
          <p className="text-white text-lg">Authenticating...</p>
          <p className="text-gray-400 text-sm mt-2">Please wait while we verify your credentials</p>
        </div>
      </div>
    );
  }

  // Show error state if authentication failed
  if (authError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4 text-gray-800">Authentication Failed</h1>
          <p className="text-red-600 mb-6">{authError}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Show success state - this only renders after successful authentication
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-4 text-gray-800">Authentication Successful!</h1>
        <p className="text-green-600 mb-4">Session established and cookies set.</p>
        <div className="flex justify-center">
          <div className="animate-pulse text-sm text-gray-500">Redirecting to dashboard...</div>
        </div>
      </div>
    </div>
  );
};

export default CodeExchange;