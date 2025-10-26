import { AppHeader } from '@/components/AppHeader'
import { SideBar } from '@/components/SideBar';
import { Button } from '@/components/ui/button';
import React,{ useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Play } from 'lucide-react';
import { Pause } from 'lucide-react';
export const CampaignDetails = () => {
    const navigate = useNavigate();
    const query = new URLSearchParams(useLocation().search);
    const [isCampaignPause, setIsCampaignPause] = useState(false);
    const prefilledCampaignName = query.get("campaignName") || "";
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  return (
    <div>
        <AppHeader onClickAction={()=> navigate(-1)} headings={prefilledCampaignName} />
            <div className="flex flex-1 overflow-hidden">
                    <SideBar collapsed={isSidebarCollapsed} />
                    
                    <div className="flex justify-between">
                        <div>
                            <div>
                                <p>Analytics</p>
                            </div>
                            <div>
                                <p>Leads</p>
                            </div>
                            <div>
                                <p>Sequences</p>
                            </div>
                        </div>
                        <div>
                            <Button variant='outline'>
                                {isCampaignPause ? <Pause className="h-6 w-6" /> :
                                (
                                    <Play onClick={()=> console.log("click")} className="h-6 w-6" />

                                )}
                            </Button>
                        </div>
                    </div>
                  </div>
    </div>
  )
}
