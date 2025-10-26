import api from '@/axiosInstance'
import { AppHeader } from '@/components/AppHeader'
import { Button } from '@/components/ui/button'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const AccountConnect: React.FC = () => {
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState<string>('')

  const handleContinue = async () => {
    if (!userEmail) {
      alert('Please enter an email address.');
      return;
    }

    try {
      const response = await api.post('/emails', { email: userEmail });
      if(response.data?.success === false){
        alert('Failed to create user email. Please try again.');
        return;
      }
      const url = `http://localhost:8080/app/dashboard/accounts/verify?token=${response.data.data.verificationToken}`;
alert(`Click the link below to verify your email:\n\n${url}`);
      navigate(`/app/dashboard/accounts`);

    } catch (error) {
      console.log("Error creating user email:", error); 
    }
  }

  const handleCancel = () => {
    setUserEmail('');
    navigate(-1);
  }

  return (
    <div className="h-screen w-screen flex flex-col">
      <AppHeader onClickAction={() => navigate(-1)} headings={"Back"} />

      <div className="max-w-md mx-auto mt-16 p-6 bg-white rounded-lg">
        {/* Heading */}
        <h1 className="text-2xl font-semibold text-gray-800 mb-1">
          Let&apos;s create a new user account
        </h1>
        <p className="text-gray-500 mb-6">
          Please enter the user&apos;s email address.
        </p>

        {/* Input */}
        <div className="mb-6">
          <label className="block text-gray-700 mb-2">Email Address</label>
          <input
            type="email"
            value={userEmail}
            onChange={(e) => setUserEmail(e.target.value)}
            placeholder="user@example.com"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primaryColor text-lg"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleCancel}
            className="text-primary hover:underline"
          >
            Cancel
          </button>
          <Button
            onClick={handleContinue}
            className="bg-gradient-primary hover:bg-transparent text-white px-6 py-3 rounded-lg"
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  )
}
export default AccountConnect