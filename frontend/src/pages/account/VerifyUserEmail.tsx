import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import api from "@/axiosInstance";
export const VerifyUserEmail: React.FC = () => {
  const navigate = useNavigate();
  const { token: paramToken } = useParams(); // for /verify/:token route
  const [searchParams] = useSearchParams(); // for ?token=... route
  const token = paramToken || searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus("error");
        return;
      }

      try {
        const response = await api.get(`/emails/verify/${token}`);

        if (response.data.success) {
          setStatus("success");
          // redirect after short delay
          setTimeout(() => navigate("/app/dashboard/accounts"), 2000);
        } else {
          setStatus("error");
        }
      } catch (error) {
        console.error("Verification failed:", error);
        setStatus("error");
      }
    };

    verifyEmail();
  }, [token, navigate]);

  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center bg-gray-50 text-center">
      {status === "loading" && (
        <div className="flex flex-col items-center">
          {/* Spinner */}
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primaryColor border-t-transparent"></div>
          <p className="text-lg font-medium text-gray-700">Verifying your email...</p>
        </div>
      )}

      {status === "success" && (
        <div className="flex flex-col items-center">
          <CheckCircle className="mb-3 h-16 w-16 text-green-500" />
          <h2 className="mb-1 text-2xl font-semibold text-green-600">Email Verified!</h2>
          <p className="text-gray-500">Redirecting you to your dashboard...</p>
        </div>
      )}

      {status === "error" && (
        <div className="flex flex-col items-center">
          <div className="mb-3 text-5xl text-red-500">✕</div>
          <h2 className="mb-1 text-2xl font-semibold text-red-600">Verification Failed</h2>
          <p className="text-gray-500">Your link may have expired or is invalid.</p>
          <button
            onClick={() => navigate("/app/dashboard/accounts")}
            className="mt-4 rounded-lg bg-primaryColor px-6 py-2 text-white"
          >
            Go to Dashboard
          </button>
        </div>
      )}
    </div>
  );
};
