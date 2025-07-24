"use client";
import React, { useLayoutEffect, useState } from 'react';
import { AlertCircle, CheckCircle, Loader } from 'lucide-react';

const CodeExchange = () => {
  const [authState, setAuthState] = useState<'loading' | 'success' | 'error'>('loading');
  const [authError, setAuthError] = useState<string | null>(null);

  useLayoutEffect(() => {
    const authenticateUser = async () => {
      try {
        // Extract code from URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const codeParam = urlParams.get('code');

        console.log("Starting authentication process");

        if (!codeParam) {
          setAuthError('No authentication code found in URL');
          setAuthState('error');
          return;
        }

        // Decode the URL-encoded parameter
        const decodedCode = decodeURIComponent(codeParam);
        console.log('Decoded code parameter:', decodedCode);

        // Parse the JSON structure
        const codeData = JSON.parse(decodedCode);
        console.log('Parsed code data:', codeData);

        // The data should have 'data' and 'signature' properties
        if (!codeData.data || !codeData.signature) {
          setAuthError('Invalid code format - missing data or signature');
          setAuthState('error');
          return;
        }

        console.log('Sending code data to backend');

        // Send the entire code data structure to backend
        const response = await fetch('https://backend.vibesec.app/api/v2/user/exchangeCode', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include', // Ensures cookies are handled properly
          body: JSON.stringify({
            code: codeData // Send the entire structure with data and signature
          })
        });

        console.log('Backend response status:', response.status);

        if (response.ok) {
          const data = await response.json();
          console.log('Authentication successful, cookies should be set');

          // Update state to success - this will trigger UI render
          setAuthState('success');

          // Redirect to dashboard after brief delay
          setTimeout(() => {
            window.location.href = '/dashboard';
          }, 1000);

        } else {
          const errorData = await response.json();
          console.error('Authentication failed:', errorData);
          setAuthError(errorData.error || 'Authentication failed');
          setAuthState('error');
        }

      } catch (error) {
        console.error('Authentication error:', error);
        setAuthError('Authentication failed. Please try again.');
        setAuthState('error');
      }
    };

    // Start authentication immediately - runs synchronously before DOM updates
    authenticateUser();
  }, []); // Empty dependency array - runs once on mount

  // Loading state - shows until backend responds
  if (authState === 'loading') {
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

  // Error state - only renders after backend error response
  if (authState === 'error') {
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

  // Success state - only renders after successful backend response and cookies are set
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