import api from "@/axiosInstance";
import React from "react";
import { Button } from "./ui/button";
import { toast } from "sonner";

export default function CsvUploader({ campaignId, onSuccess }) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await api.post(`/leads/upload?campaign=${campaignId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("✅ Upload successful: " + res.data.message);
      onSuccess();
    } catch (err: any) {
      toast.error("❌ Upload failed: " + (err.response?.data?.message || err.message));
      console.error(err);
    }
  };

  return (
    <div className="flex">
      <input
        type="file"
        accept=".csv"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />

      <Button onClick={handleButtonClick} className="bg-gradient-primary">
        📤 Upload CSV
      </Button>
    </div>
  );
}
