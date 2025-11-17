import React, { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";
import api from "@/axiosInstance";
import { EmailTable } from "./EmailTable";
import { toast } from "sonner";
export const EmailAccounts = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [emailsData, setEmailsData] = useState([]);
    const handleGetData = async () => {
      try {
        setIsLoading(true)
        const response = await api.get('/accounts');
        if(response.data.success){
          setEmailsData(response.data.data);
          setIsLoading(false);
        }
      } catch (error) {
         setIsLoading(false);
        toast.error(error?.response?.data?.message || error as string)
      }finally{
         setIsLoading(false);
      }
  };

  const handleSetPrimary = async (emailId: string) => {
    try {
      const response = await api.patch(`/accounts/${emailId}/set-primary`);
      if (response.data.success) {
        toast.success("Email set to primary");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || (error as string));
    }
  };
  const handleDeleteUser = async (emailId: string) => {
    try {
      const response = await api.delete(`/accounts/${emailId}/disconnect`);
      if (response.data.success) {
        toast.success("Account disconnected successfully");
        await handleGetData();
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || (error as string));
    }
  };

  const handleStartWarmup = async (emailId: string) => {
    try {
      const response = await api.post('/warmup', {
        emailAccountId: emailId,
        warmupSettings: {
          dailyEmailLimit: 5,
          replyRate: 30,
          openRate: 40,
          duration: 30
        }
      });
      if (response.data.success) {
        toast.success("Warmup started successfully!");
        navigate("/dashboard/email-warmup");
      } else {
        toast.error(response.data.message || "Failed to start warmup");
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to start warmup";
      toast.error(errorMessage);
    }
  };
  useEffect(() => {
    handleGetData();
  }, []);
  return (
    <div>
      <div className="mb-4 border-b pb-2 text-2xl font-bold">
        <p>Email Accounts</p>
      </div>
      <div className="flex items-center justify-end gap-4">
        <div>
          <p className="border-l pl-2 text-gray-500">
            Connect accounts to keep warm & send emails from
          </p>
        </div>
        <div>
          <Button
            onClick={() => navigate("/dashboard/accounts/connect")}
            className="bg-gradient-primary"
          >
            + Add New
          </Button>
        </div>
      </div>
      <div className="flex flex-col items-center justify-center">
        {isLoading ? (
          <p>Loading the email account...</p>
        ) : (
          <>
            {emailsData.length > 0 ? (
              <EmailTable
                onSetPrimary={(email) => handleSetPrimary(email)}
                onDeleteEmail={(value) => handleDeleteUser(value)}
                onStartWarmup={(emailId) => handleStartWarmup(emailId)}
                emails={emailsData}
              />
            ) : (
              isLoading === false && (
                <>
                  <img
                    className="h-1/2 w-1/2"
                    src={
                      "https://app.instantly.ai/_next/static/images/pixeltrue-welcome_compressed-de11c441d5eab8a212aff473eef7558c.svg"
                    }
                    alt="img"
                  />
                  <p>Add an email account to get started</p>
                </>
              )
            )}
          </>
        )}
      </div>
    </div>
  );
};
