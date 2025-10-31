import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import api from "@/axiosInstance";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Download } from "lucide-react";

const CustomConnect: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  // Form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [imapUsername, setImapUsername] = useState("");
  const [imapPassword, setImapPassword] = useState("");
  const [imapHost, setImapHost] = useState("");
  const [imapPort, setImapPort] = useState("993");
  const [smtpHost, setSmtpHost] = useState("");
  const [smtpPort, setSmtpPort] = useState("587");
  const [smtpUsername, setSmtpUsername] = useState("");
  const [smtpPassword, setSmtpPassword] = useState("");

  const handleBack = () => {
    navigate("/app/dashboard/accounts/connect");
  };

  const handleNext = async () => {
    // Validate required fields
    if (
      !email ||
      !imapHost ||
      !imapPort ||
      !imapPassword ||
      !smtpHost ||
      !smtpPort ||
      !smtpPassword
    ) {
      alert("Please fill in all required fields");
      return;
    }

    setIsLoading(true);

    const payload = {
      email,
      name: `${firstName} ${lastName}`.trim() || email,
      imap: {
        host: imapHost,
        port: parseInt(imapPort),
        secure: parseInt(imapPort) === 993, // IMAP over SSL
        user: imapUsername || email,
        pass: imapPassword,
      },
      smtp: {
        host: smtpHost,
        port: parseInt(smtpPort),
        secure: parseInt(smtpPort) === 465, // SMTP over SSL
        user: smtpUsername || email,
        pass: smtpPassword,
      },
    };

    try {
      const response = await api.post("/connect/custom", payload);
      if (response.data) {
        alert("✅ " + response.data.message);
        navigate("/app/dashboard/accounts");
      }
    } catch (error: any) {
      console.error("Error connecting custom account:", error);
      alert("Failed to connect account: " + (error.response?.data?.message || error.message));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-screen flex-col bg-gray-50">
      <AppHeader onClickAction={handleBack} headings={"Select another provider"} />

      <div className="flex-1 overflow-auto p-6">
        <div className="mx-auto max-w-2xl space-y-6">
          {/* Account Info Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-6 w-6" />
                Connect Any Provider Account
              </CardTitle>
              <p className="text-sm text-muted-foreground">IMAP / SMTP</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    placeholder="First Name"
                    value={firstName}
                    onChangeEvent={setFirstName}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    placeholder="Last Name"
                    value={lastName}
                    onChangeEvent={setLastName}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Email address to connect"
                  value={email}
                  onChangeEvent={setEmail}
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* IMAP Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-6 w-6" />
                IMAP Setup
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="imapUsername">IMAP Username</Label>
                <Input
                  id="imapUsername"
                  placeholder={email || "username@example.com"}
                  value={imapUsername}
                  onChangeEvent={setImapUsername}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="imapPassword">
                  IMAP Password <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="imapPassword"
                  type="password"
                  placeholder="IMAP Password"
                  value={imapPassword}
                  onChangeEvent={setImapPassword}
                />
              </div>
              <div className="grid grid-cols-4 gap-4">
                <div className="col-span-3 space-y-2">
                  <Label htmlFor="imapHost">
                    IMAP Host <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="imapHost"
                    placeholder="imap.website.com"
                    value={imapHost}
                    onChangeEvent={setImapHost}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="imapPort">
                    IMAP Port <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="imapPort"
                    type="number"
                    placeholder="993"
                    value={imapPort}
                    onChangeEvent={setImapPort}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SMTP Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-6 w-6" />
                SMTP Setup
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="smtpUsername">SMTP Username</Label>
                <Input
                  id="smtpUsername"
                  placeholder={email || "username@example.com"}
                  value={smtpUsername}
                  onChangeEvent={setSmtpUsername}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="smtpPassword">
                  SMTP Password <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="smtpPassword"
                  type="password"
                  placeholder="SMTP Password"
                  value={smtpPassword}
                  onChangeEvent={setSmtpPassword}
                />
              </div>
              <div className="grid grid-cols-4 gap-4">
                <div className="col-span-3 space-y-2">
                  <Label htmlFor="smtpHost">
                    SMTP Host <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="smtpHost"
                    placeholder="smtp.website.com"
                    value={smtpHost}
                    onChangeEvent={setSmtpHost}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtpPort">
                    SMTP Port <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="smtpPort"
                    type="number"
                    placeholder="587"
                    value={smtpPort}
                    onChangeEvent={setSmtpPort}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button variant="outline" onClick={handleBack} className="flex-1" disabled={isLoading}>
              &lt; Back
            </Button>
            <Button
              onClick={handleNext}
              className="flex-1 bg-green-600 hover:bg-green-700"
              disabled={isLoading}
            >
              {isLoading ? "Connecting..." : "Save >"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomConnect;
