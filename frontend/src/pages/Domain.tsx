import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Globe, Clock, CheckCircle2, Copy } from "lucide-react"
import { Header } from "@/components/Header"
import { SideBar } from "@/components/SideBar"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
type Domain = {
  name: string
  status: "Pending" | "Verified"
}

export default function Domain() {
     const [ isSidebarCollapsed, setIsSidebarCollapsed ] = React.useState(false);
      const [newDomain, setNewDomain] = useState("")
  const [selectedDomain, setSelectedDomain] = useState<Domain | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleAddDomain = () => {
    if (!newDomain.trim()) return
    setDomains([...domains, { name: newDomain, status: "Pending" }])
    setNewDomain("")
  }

  const openRecords = (domain: Domain) => {
    setSelectedDomain(domain)
    setIsDialogOpen(true)
  }

  const copyToClipboard = (value: string) => {
    navigator.clipboard.writeText(value)
  }
  const [domains, setDomains] = useState<Domain[]>([
    { name: "loopnow.in", status: "Pending" },
    { name: "velvety-newsstand.org", status: "Pending" },
    { name: "fixed-petticoat.org", status: "Verified" },
  ])

  return (
         <div className="h-screen w-screen flex flex-col">
              {/* Header component with a toggle function */}
              <Header
                onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              />
        
              {/* Main content area: Sidebar + Content */}
              <div className="flex flex-1 overflow-hidden">
                <SideBar collapsed={isSidebarCollapsed} />
        
                {/* Sidebar component */}
        
                {/* Content area: Contains EmailAccounts */}
                <div className="flex-1 overflow-auto p-6">
    <Card className="border border-gray-200 shadow-sm">
    <CardHeader className="flex flex-row items-center justify-start space-x-2 pb-2">
  <Globe className="text-blue-600" size={20} />
  <CardTitle className="text-xl font-semibold text-gray-800">
    Sending Domains
  </CardTitle>
</CardHeader>


      <CardContent>
        <p className="text-gray-500 mb-4 text-left">
          Verify your domains to start sending emails. Add the provided DNS records to your domain's registrar.
        </p>

        {/* Input Row */}
        <div className="flex gap-2 mb-6 justify-end">
          <Input
            placeholder="example.com"
            value={newDomain}
            onChange={(e) => setNewDomain(e.target.value)}
            className="max-w-sm"
          />
          <Button
            onClick={handleAddDomain}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6"
          >
            Add Domain
          </Button>
        </div>

        {/* Table */}
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="font-semibold text-gray-700">Domain</TableHead>
              <TableHead className="font-semibold text-gray-700">Status</TableHead>
              <TableHead className="font-semibold text-gray-700">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {domains.map((domain, index) => (
              <TableRow key={index} className="hover:bg-blue-50 transition">
                <TableCell className="font-medium text-gray-800">{domain.name}</TableCell>
                <TableCell>
                  {domain.status === "Pending" ? (
                    <span className="flex items-center gap-1 text-sm font-medium bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full w-fit">
                      <Clock size={14} /> Pending
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-sm font-medium bg-green-100 text-green-700 px-2 py-1 rounded-full w-fit">
                      <CheckCircle2 size={14} /> Verified
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button onClick={()=>openRecords(domain)} variant="outline" className="text-gray-700 border-gray-300 hover:bg-gray-100">
                      View Records
                    </Button>
                    {domain.status === "Pending" && (
                      <Button onClick={()=> toast.info("Under Maintainnce")} className="bg-blue-600 hover:bg-blue-700 text-white">Verify</Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
                    </div>
                    </div>
                    {/* DNS RECORDS MODAL */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>DNS Records for {selectedDomain?.name}</DialogTitle>
            <p className="text-sm text-gray-500">
              Add these records to your domain’s DNS settings. It may take some time for them to propagate.
            </p>
          </DialogHeader>

          <div className="space-y-5 py-2">
            {/* SPF */}
            <div>
              <Label className="text-sm font-semibold">SPF</Label>
              <div className="mt-1 flex flex-col gap-2">
                <Label className="text-xs text-gray-500">Record type: TXT</Label>
                <div className="flex items-center gap-2">
                  <Input value="@" readOnly className="text-sm" />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard("@")}
                  >
                    <Copy size={14} />
                  </Button>
                </div>
                 <Label className="text-xs text-gray-500">Value:</Label>
                <div className="flex items-center gap-2">
                  <Input
                    value="v=spf1 include:mail.yourplatform.com ~all"
                    readOnly
                    className="text-sm"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard("v=spf1 include:mail.yourplatform.com ~all")}
                  >
                    <Copy size={14} />
                  </Button>
                </div>
              </div>
            </div>

            {/* DKIM */}
            <div>
              <Label className="text-sm font-semibold">DKIM</Label>
              <div className="mt-1 flex flex-col gap-2">
                <Label className="text-xs text-gray-500">Record type: TXT</Label>
                <div className="flex items-center gap-2">
                  <Input value="pmta._domainkey" readOnly className="text-sm" />
                  <Button variant="outline" size="icon" onClick={() => copyToClipboard("pmta._domainkey")}>
                    <Copy size={14} />
                  </Button>
                </div>
                <Label className="text-xs text-gray-500">Value:</Label>
                <div className="flex items-center gap-2">
                  <Input
                    value="v=DKIM1; k=rsa; p=CcfbURDY5nx3ax0621mppRgdJbJncI..."
                    readOnly
                    className="text-sm"
                  />
                  <Button variant="outline" size="icon" onClick={() => copyToClipboard("v=DKIM1; k=rsa; p=CcfbURDY5nx3ax0621mppRgdJbJncI...")}>
                    <Copy size={14} />
                  </Button>
                </div>
              </div>
            </div>

            {/* CNAME */}
            <div>
              <Label className="text-sm font-semibold">Tracking CNAME</Label>
              <div className="mt-1 flex flex-col gap-2">
                <Label className="text-xs text-gray-500">Record type: CNAME</Label>
                <div className="flex items-center gap-2">
                  <Input value="tracking" readOnly className="text-sm" />
                  <Button variant="outline" size="icon" onClick={() => copyToClipboard("tracking")}>
                    <Copy size={14} />
                  </Button>
                </div>
                 <Label className="text-xs text-gray-500">Value:</Label>
                <div className="flex items-center gap-2">
                  <Input value={`tracking.${selectedDomain?.name}`} readOnly className="text-sm" />
                  <Button variant="outline" size="icon" onClick={() => copyToClipboard(`tracking.${selectedDomain?.name}`)}>
                    <Copy size={14} />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={() => setIsDialogOpen(false)} className="bg-blue-600 hover:bg-blue-700 text-white">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
                    </div>
  )
}
