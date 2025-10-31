import api from '@/axiosInstance'
import { AppHeader } from '@/components/AppHeader'
import { Button } from '@/components/ui/button'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

export const CreateCampaignForm: React.FC = () => {
    const navigate = useNavigate();
  const [campaignName, setCampaignName] = useState<string>('')

  const handleContinue = async () => {
    try {
      const response = await api.post("/campaigns",{ name: campaignName});
      if(response.data.success){
        toast.success(`Campaign Created: ${campaignName}`)
        navigate(`/app/dashboard/campaigns/details?campaignName=${encodeURIComponent(campaignName)}`) // Navigate to campaign details page;
      }
    } catch (error) {
      toast.error(error?.response?.data?.message)
    }
  }

  const handleCancel = () => {
    setCampaignName('');
    navigate(-1);
  }

  return (
     <div className="h-screen w-screen flex flex-col">
        <AppHeader onClickAction={()=> navigate(-1)} headings={"Back"} />
        <div className="max-w-md mx-auto mt-16 p-6 bg-white rounded-lg">
        {/* Heading */}
        <h1 className="text-2xl font-semibold text-gray-800 mb-1">
            Let&apos;s create a new campaign
        </h1>
        <p className="text-gray-500 mb-6">
            What would you like to name it?
        </p>

        {/* Input */}
        <div className="mb-6">
            <label className="block text-gray-700 mb-2">Campaign Name</label>
            <input
            type="text"
            value={campaignName}
            onChange={(e) => setCampaignName(e.target.value)}
            placeholder="My Campaign"
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
