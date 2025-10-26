import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Eye, Zap, Trash2 } from "lucide-react";

interface Variant {
  id: string;
  subject: string;
  body: string;
}

interface Step {
  id: string;
  name: string;
  variants: Variant[];
}

export const CampaignSequences = () => {
  const [steps, setSteps] = useState<Step[]>([
    {
      id: "step-1",
      name: "Step 1",
      variants: [
        {
          id: "variant-1",
          subject: "Welcome to the campaign",
          body: "Hey there 👋\nJust checking in to see how things are going.",
        },
      ],
    },
  ]);

  const [selected, setSelected] = useState<{ stepId: string; variantId: string }>({
    stepId: "step-1",
    variantId: "variant-1",
  });

  const selectedStep = steps.find((s) => s.id === selected.stepId);
  const selectedVariant = selectedStep?.variants.find((v) => v.id === selected.variantId);

  const addStep = () => {
    const newStep: Step = {
      id: `step-${steps.length + 1}`,
      name: `Step ${steps.length + 1}`,
      variants: [],
    };
    setSteps([...steps, newStep]);
  };

  const addVariant = (stepId: string) => {
    setSteps((prev) =>
      prev.map((s) =>
        s.id === stepId
          ? {
              ...s,
              variants: [
                ...s.variants,
                {
                  id: `variant-${s.variants.length + 1}`,
                  subject: "New Variant",
                  body: "Start typing your email content here...",
                },
              ],
            }
          : s
      )
    );
  };

  const deleteStep = (stepId: string) => {
    setSteps((prev) => prev.filter((s) => s.id !== stepId));
    if (selected.stepId === stepId) {
      setSelected({ stepId: "", variantId: "" });
    }
  };

  const deleteVariant = (stepId: string, variantId: string) => {
    setSteps((prev) =>
      prev.map((s) =>
        s.id === stepId
          ? {
              ...s,
              variants: s.variants.filter((v) => v.id !== variantId),
            }
          : s
      )
    );

    if (selected.variantId === variantId) {
      setSelected({
        stepId,
        variantId: steps.find((s) => s.id === stepId)?.variants[0]?.id || "",
      });
    }
  };

  const updateVariant = (key: "subject" | "body", value: string) => {
    setSteps((prev) =>
      prev.map((s) =>
        s.id === selected.stepId
          ? {
              ...s,
              variants: s.variants.map((v) =>
                v.id === selected.variantId ? { ...v, [key]: value } : v
              ),
            }
          : s
      )
    );
  };

  return (
    <div className="flex h-[calc(100vh-80px)] bg-gray-50">
      {/* Left Panel */}
      <div className="w-1/3 border-r bg-white p-4 overflow-y-auto">
        {steps.map((step) => (
          <Card
            key={step.id}
            className={`mb-4 transition-all cursor-pointer border-2 ${
              step.id === selected.stepId ? "border-blue-500 shadow-md" : "border-transparent hover:border-gray-300"
            }`}
            onClick={() =>
              setSelected({
                stepId: step.id,
                variantId: step.variants[0]?.id || "",
              })
            }
          >
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <h3 className="font-medium text-gray-800">{step.name}</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteStep(step.id);
                  }}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
              <div className="mt-2 space-y-2">
                {step.variants.map((v) => (
                  <div
                    key={v.id}
                    className={`flex justify-between items-center p-2 rounded-md border text-sm truncate cursor-pointer ${
                      v.id === selected.variantId ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 hover:bg-gray-100"
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelected({ stepId: step.id, variantId: v.id });
                    }}
                  >
                    <span className="truncate">{v.subject}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteVariant(step.id, v.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ))}
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    addVariant(step.id);
                  }}
                  variant="ghost"
                  size="sm"
                  className="w-full text-blue-600"
                >
                  <Plus className="h-4 w-4 mr-1" /> Add variant
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        <Button onClick={addStep} variant="outline" className="w-full border-dashed border-gray-400">
          <Plus className="h-4 w-4 mr-1" /> Add step
        </Button>
      </div>

      {/* Right Preview Panel */}
      <div className="flex-1 bg-white p-8 shadow-inner">
        {selectedVariant ? (
          <div>
            <div className="flex justify-between items-center border-b pb-4 mb-4">
              <div className="flex-1">
                <input
                  type="text"
                  value={selectedVariant.subject}
                  onChange={(e) => updateVariant("subject", e.target.value)}
                  className="w-full p-2 border rounded-md mb-2"
                  placeholder="Subject"
                />
                <textarea
                  value={selectedVariant.body}
                  onChange={(e) => updateVariant("body", e.target.value)}
                  className="w-full p-2 border rounded-md h-64"
                  placeholder="Start typing your email content here..."
                />
              </div>
              <div className="flex gap-2 ml-4">
                <Button variant="ghost" size="sm">
                  <Eye className="h-4 w-4 mr-1" /> Preview
                </Button>
                <Button variant="ghost" size="sm">
                  <Zap className="h-4 w-4 mr-1" /> Test
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-gray-500 text-center mt-20">Select a step or variant to preview.</div>
        )}
      </div>
    </div>
  );
};
