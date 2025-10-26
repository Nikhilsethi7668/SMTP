import React from "react";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";

export const EmailAccounts = () => {
    const navigate = useNavigate();

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
        <img className="h-1/2 w-1/2"
          src={
            "https://app.instantly.ai/_next/static/images/pixeltrue-welcome_compressed-de11c441d5eab8a212aff473eef7558c.svg"
          }
          alt="img"
        />
        <p>Add an email account to get started</p>
      </div>
    </div>
  );
};
