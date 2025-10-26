import React, { useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { CheckCircle } from 'lucide-react'
import api from '@/axiosInstance';
export const VerifyUserEmail: React.FC = () => {
  const navigate = useNavigate();
  const { token: paramToken } = useParams(); // for /verify/:token route
  const [searchParams] = useSearchParams(); // for ?token=... route
  const token = paramToken || searchParams.get('token');

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus('error');
        return;
      }

      try {
        const response = await api.get(`/emails/verify/${token}`);

        if (response.data.success) {
          setStatus('success');
          // redirect after short delay
          setTimeout(() => navigate('/app/dashboard/accounts'), 2000);
        } else {
          setStatus('error');
        }
      } catch (error) {
        console.error('Verification failed:', error);
        setStatus('error');
      }
    };

    verifyEmail();
  }, [token, navigate]);

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-gray-50 text-center">
      {status === 'loading' && (
        <div className="flex flex-col items-center">
          {/* Spinner */}
          <div className="w-12 h-12 border-4 border-primaryColor border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-700 text-lg font-medium">Verifying your email...</p>
        </div>
      )}

      {status === 'success' && (
        <div className="flex flex-col items-center">
          <CheckCircle className="text-green-500 w-16 h-16 mb-3" />
          <h2 className="text-2xl font-semibold text-green-600 mb-1">Email Verified!</h2>
          <p className="text-gray-500">Redirecting you to your dashboard...</p>
        </div>
      )}

      {status === 'error' && (
        <div className="flex flex-col items-center">
          <div className="text-red-500 text-5xl mb-3">✕</div>
          <h2 className="text-2xl font-semibold text-red-600 mb-1">Verification Failed</h2>
          <p className="text-gray-500">Your link may have expired or is invalid.</p>
          <button
            onClick={() => navigate('/app/dashboard/accounts')}
            className="mt-4 bg-primaryColor text-white px-6 py-2 rounded-lg"
          >
            Go to Dashboard
          </button>
        </div>
      )}
    </div>
  );
};
