import React, { useState } from 'react'
import { Button } from './ui/button'
import { Dropdown } from './Dropdown'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CampaignTable } from './Campaigntable'
export const CampaignsLayout: React.FC = () => {
    const navigate = useNavigate();
  const [search, setSearch] = useState<string>('')
  const [type, setType] = useState<string>('All Types')
  const [status, setStatus] = useState<string>('All Status')

  return (
    <div>
      {/* Header */}
      <div className="text-2xl font-bold mb-4 border-b pb-2">
        <p>Campaigns</p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        {/* Search Bar */}
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search campaigns..."
          className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primaryColor w-full md:w-64"
        />

        {/* Actions */}
        <div className="flex gap-4 items-center">
          {/* Dropdowns */}
          <div className="flex gap-2 md:gap-6">
            <Dropdown
              options={['All Types', 'Email', 'Social', 'Paid Ads']}
              value={type}
              onChange={setType}
            />
            <Dropdown
              options={['All Status', 'Active', 'Paused', 'Completed']}
              value={status}
              onChange={setStatus}
            />
          </div>

          {/* Divider */}
          <span className="text-gray-300 hidden md:block">|</span>

          {/* Import & Add New */}
          <div className="flex gap-4 md:gap-6 items-center">
            <Button variant="ghost" className="text-gray-600 hover:text-gray-800">
              📤 Import
            </Button>
            <Button onClick={()=> navigate("/app/dashboard/campaigns/create")} className="bg-gradient-primary text-white">
              + Add New
            </Button>
          </div>
        </div>
      </div>

      {/* Campaigns Table Placeholder */}
      <div className="p-4 text-center text-gray-500 rounded">
        <Card>
            <CardHeader>
              <CardTitle>Campaign Overview</CardTitle>
              <CardDescription>Manage and monitor all your email campaigns</CardDescription>
            </CardHeader>
            <CardContent>
              <CampaignTable />
            </CardContent>
          </Card>
      </div>
    </div>
  )
}
