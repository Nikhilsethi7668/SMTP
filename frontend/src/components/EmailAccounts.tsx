import React, { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";
import api from "@/axiosInstance";
import { EmailTable } from "./EmailTable";
export const EmailAccounts = () => {
    const navigate = useNavigate();
    const [emailsData, setEmailsData] = useState([]);
    const handleGetData = async () => {
      try {
        const response = await api.get('/accounts');
        if(response.data.success){
          setEmailsData(response.data.data);
          console.log("Email accounts loaded:", response.data.data);
        } else {
          console.error("Failed to fetch accounts:", response.data.message);
          setEmailsData([]);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setEmailsData([]);
      }
    };

    const handleSetPrimary = async (emailId: string) => {
      try {
        const response = await api.patch(`/accounts/${emailId}/set-primary`);
        if(response.data.success){
          alert("Email set as primary successfully");
          await handleGetData(); // Refresh the data after setting primary
        }
      } catch (error) {
        console.log("Error occurred", error);
        alert("Failed to set email as primary");
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
         {emailsData.length > 0 ? (
          <EmailTable onSetPrimary={(emailId)=> handleSetPrimary(emailId)} onDeleteEmail={(emailId) => handleDeleteUser(emailId)} emails={emailsData} />
        ):(
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
       
      </div>
    </div>
  );
};
