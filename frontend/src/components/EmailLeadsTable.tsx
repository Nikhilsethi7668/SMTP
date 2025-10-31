import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Info, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import CsvUploader from "./CsvUploader";

interface LeadEmail {
  _id: string;
  email: string;
  provider: "Google" | "Microsoft" | "Other";
  securityGateway: string;
  status: "Not yet contacted" | "Contacted" | "Bounced" | "Replied";
}

interface EmailLeadsTableProps {
  data: LeadEmail[];
  onAddLead?: () => void;
  campaignId?: string;
  refetchData?: () => void;
}

export const EmailLeadsTable: React.FC<EmailLeadsTableProps> = ({
  data,
  onAddLead,
  campaignId,
  refetchData,
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  // Filter leads by email
  const filteredData = data.filter((lead) =>
    lead.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="overflow-hidden rounded-lg border shadow-sm">
      {/* Top controls: Search + Add Lead */}
      <div className="flex items-center justify-between border-b bg-gray-50 p-4">
        <input
          type="text"
          placeholder="Search by email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-1/2 rounded-md border px-3 py-2 text-black placeholder-gray-400"
        />
        <div className="flex gap-4">
          <Button onClick={onAddLead} className="flex items-center gap-2">
            <Plus className="h-4 w-4" /> Add Lead
          </Button>

          <CsvUploader onSuccess={refetchData} campaignId={campaignId} />
        </div>
      </div>

      <Table className="w-full [&_td]:text-left [&_th]:text-left">
        <TableHeader>
          <TableRow className="bg-muted/40 text-gray-600">
            <TableHead className="w-12">
              <Checkbox />
            </TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wide">Email</TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wide">
              Email Provider
            </TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wide">
              Email Security Gateway
            </TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wide">Status</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {filteredData.map((lead) => (
            <TableRow key={lead._id} className="transition hover:bg-muted/20">
              <TableCell>
                <Checkbox />
              </TableCell>
              <TableCell className="font-medium">{lead.email}</TableCell>

              {/* Provider */}
              <TableCell>
                <div className="flex items-center gap-2">
                  {lead.provider === "Google" && <span className="h-4 w-4 text-red-500" />}
                  <span>{lead.provider}</span>
                </div>
              </TableCell>

              {/* Security Gateway */}
              <TableCell>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="border-green-200 bg-green-50 text-green-600">
                    {lead.securityGateway || "None"}
                  </Badge>
                  <Info className="h-4 w-4 text-gray-400" />
                </div>
              </TableCell>

              {/* Status */}
              <TableCell>
                <Badge variant="outline" className="border-gray-200 bg-gray-50 text-gray-600">
                  {lead.status}
                </Badge>
              </TableCell>
            </TableRow>
          ))}

          {filteredData.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="py-4 text-center text-gray-500">
                No leads found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
