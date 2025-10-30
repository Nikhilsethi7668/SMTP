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
        const response = await api.get('/emails');
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
        if(response.data.success){
          toast.success("Email set to primary");
        }
      } catch (error) {
        toast.error(error?.response?.data?.message || error as string);
      }
    };
    const handleDeleteUser = async (emailId: string) => {
      try {
        const response = await api.delete(`/accounts/${emailId}/disconnect`);
        if(response.data.success){
          alert("Account disconnected successfully");
          await handleGetData();
        }
      } catch (error) {
        console.log("Error occurred", error);
        alert("Failed to disconnect account");
      }
    }
    useEffect(() => {
      handleGetData();
    }, []);
  return (
    <div>
      <div className="text-2xl font-bold mb-4 border-b pb-2">
        <p>Email Accounts</p>
      </div>
      <div className="flex items-center gap-4 justify-end">
        <div>
          <p className="text-gray-500 border-l pl-2">
            Connect accounts to keep warm & send emails from
          </p>
        </div>
        <div>
          <Button onClick={()=> navigate("/app/dashboard/accounts/connect")} className="bg-gradient-primary">+ Add New</Button>
        </div>
      </div>
      <div className="flex flex-col justify-center items-center">
        {isLoading ? (
          <p>Loading the email account...</p>
        ):(
          <>
            {emailsData.length > 0 ? (
              <EmailTable onSetPrimary={(email)=> handleSetPrimary(email)} onDeleteEmail={(value) => handleDeleteUser(value)} emails={emailsData} />
            ): isLoading === false && (
              <>
                <img className="h-1/2 w-1/2"
                  src={
                    "https://app.instantly.ai/_next/static/images/pixeltrue-welcome_compressed-de11c441d5eab8a212aff473eef7558c.svg"
                  }
                  alt="img"
                />
                <p>Add an email account to get started</p>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};
