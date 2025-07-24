"use client";

import React, { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle, Loader } from 'lucide-react';

const CodeExchange = () => {
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('Verifying authentication...');

  useEffect(() => {
    const exchangeCodeForTokens = async () => {
      try {
        // Extract code from URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const codeParam = urlParams.get('code');
        
        if (!codeParam) {
          setStatus('error');
          setMessage('No authentication code found in URL');
          return;
        }

        // Decode and parse the code parameter
        const decodedCode = decodeURIComponent(codeParam);
        const codeData = JSON.parse(decodedCode);
        
        // Extract the actual code from the data structure
        const actualCode = JSON.parse(atob(codeData.data)).code;
        
        console.log('Exchanging code:', actualCode);

        // Call your backend API to exchange code for session tokens
        const response = await fetch('https://backend.vibesec.app/api/v2/user/callback', {  
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include', // Ensures cookies are handled properly
          body: JSON.stringify({
            code: actualCode
          })
        });

        if (response.ok) {
          const data = await response.json();
          setStatus('success');
          setMessage('Authentication successful! Session established.');
          
          // Redirect to your main application after successful token exchange
          setTimeout(() => {
            window.location.href = '/dashboard'; // Change to your desired route
          }, 1500);
        } else {
          const errorData = await response.json();
          setStatus('error');
          setMessage(errorData.error || 'Failed to authenticate');
        }

      } catch (error) {
        console.error('Authentication error:', error);
        setStatus('error');
        setMessage('Authentication failed. Please try again.');
      }
    };

    // Call the function immediately when component mounts
    exchangeCodeForTokens();
  }, []); // Empty dependency array = runs once on mount

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Authentication</h1>
        
        {status === 'loading' && (
          <div className="space-y-4">
            <Loader className="w-12 h-12 animate-spin text-blue-500 mx-auto" />
            <p className="text-gray-600">{message}</p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-4">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
            <p className="text-green-600 font-medium">{message}</p>
            <div className="flex justify-center">
              <div className="animate-pulse text-sm text-gray-500">Redirecting...</div>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
            <p className="text-red-600 font-medium">{message}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CodeExchange;