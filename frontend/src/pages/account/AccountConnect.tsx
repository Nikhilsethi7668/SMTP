import { AppHeader } from "@/components/AppHeader";
import React from "react";
import { useNavigate } from "react-router-dom";

export default function AccountConnect() {
    const navigate = useNavigate();
  return (
    <div>
      <AppHeader
        onClickAction={() => navigate(-1)}
        headings={"Back"}
        icon="<"
      />
        <div className="flex justify-center items-center mt-20">
            <h1 >Coming soon...</h1>
            </div>
    </div>
  );
}
