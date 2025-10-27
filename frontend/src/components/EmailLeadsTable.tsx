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
  refetchData?: ()=> void
  
}

export const EmailLeadsTable: React.FC<EmailLeadsTableProps> = ({ data, onAddLead, campaignId, refetchData }) => {
  const [searchQuery, setSearchQuery] = useState("");

  // Filter leads by email
  const filteredData = data.filter((lead) =>
    lead.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="border rounded-lg overflow-hidden shadow-sm">
      {/* Top controls: Search + Add Lead */}
      <div className="flex justify-between items-center p-4 border-b bg-gray-50">
        <input
          type="text"
          placeholder="Search by email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-1/2 px-3 py-2 border rounded-md text-black placeholder-gray-400"
        />
        <div className="flex gap-4">
          <Button onClick={onAddLead} className="flex items-center gap-2">
            <Plus className="h-4 w-4" /> Add Lead
          </Button>

       <CsvUploader onSuccess={refetchData} campaignId={campaignId}/>
        </div>
      </div>

      <Table className="[&_th]:text-left [&_td]:text-left w-full">
        <TableHeader>
          <TableRow className="bg-muted/40 text-gray-600">
            <TableHead className="w-12">
              <Checkbox />
            </TableHead>
            <TableHead className="font-semibold text-xs uppercase tracking-wide">
              Email
            </TableHead>
            <TableHead className="font-semibold text-xs uppercase tracking-wide">
              Email Provider
            </TableHead>
            <TableHead className="font-semibold text-xs uppercase tracking-wide">
              Email Security Gateway
            </TableHead>
            <TableHead className="font-semibold text-xs uppercase tracking-wide">
              Status
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {filteredData.map((lead) => (
            <TableRow key={lead._id} className="hover:bg-muted/20 transition">
              <TableCell>
                <Checkbox />
              </TableCell>
              <TableCell className="font-medium">{lead.email}</TableCell>

              {/* Provider */}
              <TableCell>
                <div className="flex items-center gap-2">
                  {lead.provider === "Google" && <span className="text-red-500 h-4 w-4" />}
                  <span>{lead.provider}</span>
                </div>
              </TableCell>

              {/* Security Gateway */}
              <TableCell>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className="bg-green-50 text-green-600 border-green-200"
                  >
                    {lead.securityGateway || "None"}
                  </Badge>
                  <Info className="h-4 w-4 text-gray-400" />
                </div>
              </TableCell>

              {/* Status */}
              <TableCell>
                <Badge
                  variant="outline"
                  className="bg-gray-50 text-gray-600 border-gray-200"
                >
                  {lead.status}
                </Badge>
              </TableCell>
            </TableRow>
          ))}

          {filteredData.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-gray-500 py-4">
                No leads found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
