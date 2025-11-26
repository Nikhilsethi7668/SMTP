import React, { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2, Save, Zap } from "lucide-react";
import { campaignSequenceApi } from "@/services/campaignSequenceApi";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import { Input } from "@/components/ui/input";
import api from "@/axiosInstance";
import { toast } from "sonner";
interface Variant {
  _id: string;
  subject: string;
  body: string;
}

interface Step {
  _id: string;
  name: string;
  order: number;
  variants: Variant[];
}

export const CampaignSequences = ({ campaignId }: { campaignId: string }) => {
  const [steps, setSteps] = useState<Step[]>([]);
  const [selected, setSelected] = useState<{ stepId: string; variantId: string }>({
    stepId: "",
    variantId: "",
  });

  const [editorState, setEditorState] = useState<{ subject: string; body: string }>({
    subject: "",
    body: "",
  });

  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // ---------- TEST EMAIL STATES ----------
  const [testDialogOpen, setTestDialogOpen] = useState(false);
  const [fromEmail, setFromEmail] = useState("");
  const [toEmail, setToEmail] = useState("");
  const [sendingTest, setSendingTest] = useState(false);

  
  useEffect(() => {
    if(testDialogOpen === true){
      handleGetData();
    }
  }, [testDialogOpen]);
  // Demo FROM dropdown list (replace with API list if needed)


  // ---------- SELECTED ----------
  const selectedStep = steps.find((s) => s._id === selected.stepId);
  const selectedVariant = selectedStep?.variants.find((v) => v._id === selected.variantId);

  // ---------- LOAD DATA ----------
  const loadData = async () => {
    const res = await campaignSequenceApi.getSteps(campaignId);
    const stepsList = res.steps;

    const stepsWithVariants = await Promise.all(
      stepsList.map(async (step) => {
        const varRes = await campaignSequenceApi.getVariants(step._id);
        return { ...step, variants: varRes.variants };
      })
    );

    setSteps(stepsWithVariants);

    // Auto-select first variant
    if (stepsWithVariants.length > 0) {
      const first = stepsWithVariants[0];
      const v = first.variants[0];

      setSelected({
        stepId: first._id,
        variantId: v?._id || "",
      });

      if (v) {
        setEditorState({ subject: v.subject, body: v.body });
      }
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedVariant) {
      setEditorState({
        subject: selectedVariant.subject,
        body: selectedVariant.body,
      });
    }
  }, [selectedVariant?._id]);

  // ---------- ADD STEP ----------
  const addStep = async () => {
    const newOrder = steps.length + 1;

    const res = await campaignSequenceApi.createStep({
      campaign_id: campaignId,
      name: `Step ${newOrder}`,
      order: newOrder,
    });

    setSteps((prev) => [...prev, { ...res.step, variants: [] }]);
  };

  // ---------- DELETE STEP ----------
  const deleteStep = async (stepId: string) => {
    await campaignSequenceApi.deleteStep(stepId);
    setSteps((prev) => prev.filter((s) => s._id !== stepId));

    if (selected.stepId === stepId) {
      setSelected({ stepId: "", variantId: "" });
    }
  };

  // ---------- ADD VARIANT ----------
  const addVariant = async (stepId: string) => {
    const res = await campaignSequenceApi.createVariant({
      step_id: stepId,
      campaign_id: campaignId,
      subject: "New Variant",
      body: "Start typing...",
    });

    setSteps((prev) =>
      prev.map((s) =>
        s._id === stepId ? { ...s, variants: [...s.variants, res.variant] } : s
      )
    );
  };

  // ---------- DELETE VARIANT ----------
  const deleteVariant = async (stepId: string, variantId: string) => {
    await campaignSequenceApi.deleteVariant(variantId);

    setSteps((prev) =>
      prev.map((s) =>
        s._id === stepId
          ? { ...s, variants: s.variants.filter((v) => v._id !== variantId) }
          : s
      )
    );
  };

  // ---------- SUBJECT DEBOUNCED UPDATE ----------
  const updateSubjectDebounced = (value: string) => {
    setEditorState((prev) => ({ ...prev, subject: value }));

    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    debounceTimer.current = setTimeout(async () => {
      if (!selectedVariant) return;

      const updated = await campaignSequenceApi.updateVariant(selectedVariant._id, {
        subject: value,
      });

      setSteps((prev) =>
        prev.map((s) =>
          s._id === selected.stepId
            ? {
                ...s,
                variants: s.variants.map((v) =>
                  v._id === selected.variantId ? updated.variant : v
                ),
              }
            : s
        )
      );
    }, 2000);
  };

  // ---------- SAVE BODY ----------
  const saveBody = async () => {
    if (!selectedVariant) return;

    const updated = await campaignSequenceApi.updateVariant(selectedVariant._id, {
      body: editorState.body,
    });

    setSteps((prev) =>
      prev.map((s) =>
        s._id === selected.stepId
          ? {
              ...s,
              variants: s.variants.map((v) =>
                v._id === selected.variantId ? updated.variant : v
              ),
            }
          : s
      )
    );

    toast.success("Saved!");
  };

   const [isLoading, setIsLoading] = useState(false);
    const [emailsData, setEmailsData] = useState([]);
const extractDomainProviderEmails = (accounts: any[]): string[] => {
  if (!Array.isArray(accounts)) return [];

  return accounts
    .filter(acc => acc.provider === "domain") // only domain provider
    .map(acc => acc.email)
    .filter(email => typeof email === "string" && email.trim() !== "");
};

    const handleGetData = async () => {
      try {
        setIsLoading(true)
        const response = await api.get('/accounts');
        if(response.data.success){
          setIsLoading(false);
          const emails = extractDomainProviderEmails(response.data.data);
          setEmailsData(emails);
        }
      } catch (error) {
         setIsLoading(false);
        toast.error(error?.response?.data?.message || error as string)
      }finally{
         setIsLoading(false);
      }
  };
  // ---------- SEND TEST EMAIL ----------
  const submitTestEmail = async () => {
    if (!fromEmail || !toEmail) {
      toast.warning("Please select FROM and enter TO email");
      return;
    }

    setSendingTest(true);

    try {
      const res = await campaignSequenceApi.testVariantEmail(
        selected.variantId,
        fromEmail,
        toEmail
      );

      if (res.success) {
        toast.success("Test email sent!");
        setTestDialogOpen(false);
        setToEmail("");
        setSendingTest(false);
      } else {
        toast.error("Failed to send test email");
      }
    } catch (err) {
      toast.error("Error sending test email.");
    }finally{
      setSendingTest(false);
    }

  };

  return (
    <div className="flex h-[calc(100vh-80px)] bg-gray-50">

      {/* ---------- LEFT PANEL ---------- */}
      <div className="w-1/3 overflow-y-auto border-r bg-white p-4">
        {steps.map((step) => (
          <Card
            key={step._id}
            className={`mb-4 cursor-pointer border-2 transition-all ${
              step._id === selected.stepId
                ? "border-blue-500 shadow-md"
                : "border-transparent hover:border-gray-300"
            }`}
            onClick={() =>
              setSelected({
                stepId: step._id,
                variantId: step.variants[0]?._id || "",
              })
            }
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-800">{step.name}</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteStep(step._id);
                  }}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>

              <div className="mt-2 space-y-2">
                {step.variants.map((v) => (
                  <div
                    key={v._id}
                    className={`flex cursor-pointer items-center justify-between truncate rounded-md border p-2 text-sm ${
                      v._id === selected.variantId
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-gray-200 hover:bg-gray-100"
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelected({ stepId: step._id, variantId: v._id });
                    }}
                  >
                    <span className="truncate">{v.subject}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteVariant(step._id, v._id);
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ))}

                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    addVariant(step._id);
                  }}
                  variant="ghost"
                  size="sm"
                  className="w-full text-blue-600"
                >
                  <Plus className="mr-1 h-4 w-4" /> Add variant
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        <Button
          onClick={addStep}
          variant="outline"
          className="w-full border-dashed border-gray-400"
        >
          <Plus className="mr-1 h-4 w-4" /> Add step
        </Button>
      </div>

      {/* ---------- RIGHT PANEL ---------- */}
      <div className="flex-1 bg-white p-8 shadow-inner">
        {selectedVariant ? (
          <div>
            <div className="mb-4 flex items-center justify-between border-b pb-4">
              <div className="flex-1">
                <input
                  type="text"
                  value={editorState.subject}
                  onChange={(e) => updateSubjectDebounced(e.target.value)}
                  className="mb-2 w-full rounded-md border p-2"
                  placeholder="Subject"
                />

                <textarea
                  value={editorState.body}
                  onChange={(e) =>
                    setEditorState((prev) => ({ ...prev, body: e.target.value }))
                  }
                  className="h-64 w-full rounded-md border p-2"
                  placeholder="Start typing your email content here..."
                />
              </div>

              {/* RIGHT SIDE BUTTONS */}
              <div className="ml-4 flex flex-col gap-2">
                {/* TEST EMAIL DIALOG */}
                <Dialog open={testDialogOpen} onOpenChange={setTestDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="secondary" size="sm">
                      <Zap className="mr-1 h-4 w-4" /> Test
                    </Button>
                  </DialogTrigger>

                  <DialogContent className="max-w-sm">
                    <DialogHeader>
                      <DialogTitle>Send Test Email</DialogTitle>
                    </DialogHeader>

                    <div className="mt-4 space-y-4">

                      {/* FROM EMAIL DROPDOWN */}
                      <div>
                        <label className="text-sm font-medium">From Email</label>
                        <Select onValueChange={(v) => setFromEmail(v)}>
                          <SelectTrigger className="w-full mt-2">
                            <SelectValue placeholder="Select From Email" />
                          </SelectTrigger>
                          <SelectContent>
                            {emailsData.map((email) => (
                              <SelectItem key={email} value={email}>
                                {email}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* TO EMAIL INPUT */}
                      <div>
                        <label className="text-sm font-medium">To Email</label>
                        <Input
                          type="email"
                          value={toEmail}
                          onChange={(e) => setToEmail(e.target.value)}
                          placeholder="recipient@example.com"
                          className="mt-2"
                        />
                      </div>
                    </div>

                    <DialogFooter>
                      <Button variant="outline" onClick={() => {setTestDialogOpen(false); setToEmail("")}}>
                        Cancel
                      </Button>
                      <Button onClick={submitTestEmail} disabled={sendingTest}>
                        {sendingTest ? "Sending..." : "Send Test"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                {/* SAVE BUTTON */}
                <Button variant="default" size="sm" onClick={saveBody}>
                  <Save className="mr-1 h-4 w-4" /> Save
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-20 text-center text-gray-500">
            Select a step or variant to preview.
          </div>
        )}
      </div>
    </div>
  );
};
