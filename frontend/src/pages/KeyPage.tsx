import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { Copy, RefreshCcw, Trash2, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

interface ApiKey {
  id: number;
  key: string;
  rate_limit?: number;
  expires_at?: string;
  last_used_at?: string;
  is_active: boolean;
  created_at: string;
}

export default function ApiKeysPage() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const fetchKeys = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:5000/api/keys", { credentials: "include" });
      const data = await res.json();
      setApiKeys(data);
    } catch (error) {
      toast({ title: "Error fetching API keys", description: String(error), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKeys();
  }, []);

  const createKey = async () => {
    try {
      setCreating(true);
      const res = await fetch("http://localhost:5000/api/keys", {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create key");
      toast({ title: "API Key generated successfully" });
      fetchKeys();
    } catch (err) {
      toast({ title: "Error", description: String(err), variant: "destructive" });
    } finally {
      setCreating(false);
    }
  };

  const deleteKey = async (id: number) => {
    if (!confirm("Are you sure you want to delete this key?")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/keys/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete key");
      toast({ title: "API Key deleted" });
      fetchKeys();
    } catch (err) {
      toast({ title: "Error deleting key", description: String(err), variant: "destructive" });
    }
  };

  const regenerateKey = async (id: number) => {
    if (!confirm("Regenerate this key? The old one will be invalidated.")) return;
    await deleteKey(id);
    await createKey();
  };

  const copyToClipboard = (key: string) => {
    navigator.clipboard.writeText(key);
    toast({ title: "Copied to clipboard!" });
  };

  return (
    <div className="max-w-3xl mx-auto py-10 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">API Keys</h1>
        <Button onClick={createKey} disabled={creating}>
          <Plus className="w-4 h-4 mr-2" />
          Generate Key
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
        </div>
      ) : apiKeys.length === 0 ? (
        <Card>
          <CardContent className="py-6 text-center text-gray-500">
            No API keys yet. Click “Generate Key” to create one.
          </CardContent>
        </Card>
      ) : (
        apiKeys.map((key) => (
          <Card key={key.id} className="relative group">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base font-medium">
                Key #{key.id} — {key.is_active ? "Active" : "Inactive"}
              </CardTitle>
              <div className="flex gap-2">
                <Button size="icon" variant="outline" onClick={() => copyToClipboard(key.key)}>
                  <Copy className="w-4 h-4" />
                </Button>
                <Button size="icon" variant="outline" onClick={() => regenerateKey(key.id)}>
                  <RefreshCcw className="w-4 h-4" />
                </Button>
                <Button size="icon" variant="destructive" onClick={() => deleteKey(key.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-2">
              <div className="flex items-center gap-2">
                <Input value={key.key} readOnly className="font-mono text-sm" />
              </div>
              <p className="text-xs text-gray-500">
                Created: {new Date(key.created_at).toLocaleString()}
                {key.last_used_at && (
                  <> | Last used: {new Date(key.last_used_at).toLocaleString()}</>
                )}
              </p>
              {key.expires_at && (
                <p className="text-xs text-gray-500">
                  Expires: {new Date(key.expires_at).toLocaleString()}
                </p>
              )}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
