"use client";

import React, { useEffect, useRef, useState } from "react";
import { AlertCircle, CheckCircle, Loader } from "lucide-react";
import axios from "axios";

type AuthState = "loading" | "success" | "error";

const CodeExchange: React.FC = () => {
  const [authState, setAuthState] = useState<AuthState>("loading");
  const [authError, setAuthError] = useState<string | null>(null);
  const [redirecting, setRedirecting] = useState(false);

  const hasCalled = useRef(false);

  useEffect(() => {
    if (hasCalled.current) return;
    hasCalled.current = true;

    const controller = new AbortController();

    const authenticateUser = async () => {
      try {
        const url = new URL(window.location.href);
        const codeParam = url.searchParams.get("code");

        if (!codeParam) {
          if (authState === "success") return;
          setAuthError("No authentication code found in URL");
          setAuthState("error");
          return;
        }

        url.searchParams.delete("code");
        window.history.replaceState({}, document.title, url.toString());

        const decodedCode = decodeURIComponent(codeParam);
        const codeData = JSON.parse(decodedCode);

        if (!codeData.data || !codeData.signature) {
          setAuthError("Invalid code format - missing data or signature");
          setAuthState("error");
          return;
        }

        console.log("Sending request to backend with code:", codeData);

        const response = await axios.post(
          // "https://backend.vibesec.app/api/v2/admin/getAllUserPayments",
          "https://backend.vibesec.app/api/v2/user/exchangeCode",

          { code: codeData },
          {
            headers: { "Content-Type": "application/json" },
            withCredentials: true,
            signal: controller.signal,
            validateStatus: () => true, // Prevent Axios from throwing on 401
          }
        );

        console.log("Backend response:", response); // Full response object
        console.log("Backend response data:", response.data); // Data payload

        if (response.status >= 200 && response.status < 300) {
          setAuthState("success");
          setRedirecting(true);

          setTimeout(() => {
            window.location.href = "/dashboard";
          }, 1000);
        } else {
          setAuthError(response.data?.error || "Authentication failed");
          setAuthState("error");
        }
      } catch (error: any) {
        if (error?.name === "AbortError") return;
        console.error("Unexpected error during authentication:", error);
        setAuthError("Authentication failed. Please try again.");
        setAuthState("error");
      }
    };

    authenticateUser();

    return () => controller.abort();
  }, [authState]);

  if (authState === "loading") {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-16 h-16 animate-spin text-blue-400 mx-auto mb-4" />
          <p className="text-white text-lg">Authenticating...</p>
          <p className="text-gray-400 text-sm mt-2">
            Please wait while we verify your credentials
          </p>
        </div>
      </div>
    );
  }

  if (authState === "error") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4 text-gray-800">
            Authentication Failed
          </h1>
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

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-4 text-gray-800">
          Authentication Successful!
        </h1>
        <p className="text-green-600 mb-4">Session established and cookies set.</p>
        {redirecting && (
          <div className="flex justify-center">
            <div className="animate-pulse text-sm text-gray-500">
              Redirecting to dashboard...
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CodeExchange;
