import { Check } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";

const GoogleConnect: React.FC = () => {
  const navigate = useNavigate();

  const handleGoogleOAuth = () => {
    navigate("/dashboard/accounts/connect/google/oauth");
  };

  const handleAppPasswordConnect = () => {
    navigate("/dashboard/accounts/connect/google/app-password");
  };

  return (
    <div className="flex min-h-screen w-screen flex-col">
      <div className="flex items-center p-6">
        <button 
          onClick={() => navigate("/dashboard/accounts/connect")} 
          className="flex items-center text-gray-400 hover:text-white transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-4 w-4">
            <path d="m15 18-6-6 6-6"/>
          </svg>
          Select another provider
        </button>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center p-4">
        <div className="mb-12 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white p-2">
            <svg viewBox="0 0 24 24" className="h-8 w-8">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-semibold">Connect Your Google Account</h1>
            <p className="text-gray-400">Gmail / G-Suite</p>
          </div>
        </div>

        <h2 className="mb-8 text-lg font-medium text-blue-400">Select a connection option</h2>

        <div className="flex flex-col gap-6 md:flex-row">
          {/* Option 1: OAuth */}
          <div 
            onClick={handleGoogleOAuth}
            className="relative flex w-full max-w-sm cursor-pointer flex-col items-center rounded-xl bg-blue-600 p-8 text-white shadow-lg transition-transform hover:scale-105 md:w-96"
          >
            <div className="absolute -inset-0.5 rounded-xl bg-blue-400 opacity-30 blur"></div>
            <div className="relative flex w-full flex-col items-center">
              <h3 className="mb-8 text-xl font-bold">Option 1: OAuth</h3>
              
              <div className="mb-12 w-full space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-blue-600">
                    <Check className="h-4 w-4" />
                  </div>
                  <span className="font-medium">Easier to setup</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-blue-600">
                    <Check className="h-4 w-4" />
                  </div>
                  <span className="font-medium">More stable and less disconnects</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-blue-600">
                    <Check className="h-4 w-4" />
                  </div>
                  <span className="font-medium">Available for GSuite accounts</span>
                </div>
              </div>

              <div className="mt-auto rounded-md bg-green-900/40 px-6 py-2 text-green-400 ring-1 ring-green-400/50">
                Recommended
              </div>
            </div>
          </div>

          {/* Option 2: App Password */}
          <div 
            onClick={handleAppPasswordConnect}
            className="flex w-full max-w-sm cursor-pointer flex-col items-center rounded-xl border border-gray-800 bg-[#1a1a1a] p-8 text-gray-300 transition-transform hover:scale-105 md:w-96"
          >
            <h3 className="mb-8 text-xl font-bold text-blue-400">Option 2: App Password</h3>
            
            <div className="mb-12 w-full space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-700 text-gray-300">
                  <Check className="h-4 w-4" />
                </div>
                <span className="font-medium">Available for personal accounts</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full border border-orange-500 text-orange-500">
                  <span className="text-xs font-bold">!</span>
                </div>
                <span className="font-medium">Requires 2-factor authentication</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full border border-orange-500 text-orange-500">
                  <span className="text-xs font-bold">!</span>
                </div>
                <span className="font-medium">More prone to disconnects</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoogleConnect;
