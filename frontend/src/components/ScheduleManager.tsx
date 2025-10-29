
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { CalendarDays } from "lucide-react";

/**
 * ✅ Mock API endpoints for demo
 * Replace with real endpoints later:
 * - GET /api/schedules
 * - POST /api/schedules
 * - PUT /api/schedules/:id
 */
async function fetchSchedules() {
    return [];
  const res = await fetch("/api/schedules");
}

async function saveSchedule(schedule: any) {
  const res = await fetch("/api/schedules", {
    method: schedule.id ? "PUT" : "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(schedule),
  });
  return res.ok ? res.json() : null;
}

export default function ScheduleManager() {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [selected, setSelected] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const data = await fetchSchedules();
      setSchedules(data.length ? data : [{ name: "New schedule" }]);
      setLoading(false);
    };
    load();
  }, []);

  const handleSave = async () => {
    const current = schedules[selected];
    const updated = await saveSchedule(current);
    if (updated) {
      alert("✅ Schedule saved successfully!");
      // Optionally refresh the list from backend
      const refreshed = await fetchSchedules();
      setSchedules(refreshed);
    } else {
      alert("❌ Failed to save schedule");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-slate-500">
        Loading schedules...
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row gap-6 w-full max-w-6xl mx-auto p-6">
      {/* LEFT SIDEBAR */}
      <div className="w-full md:w-1/3 border rounded-xl p-4 bg-white shadow-sm">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-slate-500" />
              <span className="text-slate-700 font-medium">Start</span>
            </div>
            <span className="text-blue-600 text-sm font-medium cursor-pointer">
              Now
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-slate-500" />
              <span className="text-slate-700 font-medium">End</span>
            </div>
            <span className="text-slate-500 text-sm">No end date</span>
          </div>

          <div className="border-t my-3" />

          <div className="space-y-2">
            {schedules.map((sch, i) => (
              <div
                key={i}
                onClick={() => setSelected(i)}
                className={`cursor-pointer rounded-lg border px-4 py-3 transition ${
                  selected === i
                    ? "border-blue-500 bg-blue-50"
                    : "border-slate-200 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-blue-600" />
                  <span className="text-slate-800 font-medium">{sch.name}</span>
                </div>
              </div>
            ))}
            <Button
              variant="outline"
              className="w-full mt-2"
              onClick={() =>
                setSchedules([
                  ...schedules,
                  { name: `Schedule ${schedules.length + 1}` },
                ])
              }
            >
              Add schedule
            </Button>
          </div>
        </div>
      </div>

      {/* RIGHT CONTENT */}
      <div className="flex-1 space-y-6">
        {/* Schedule Name */}
        <Card className="shadow-sm">
          <CardContent className="p-6 space-y-4">
            <div>
              <Label className="text-slate-700 font-medium">Schedule Name</Label>
              <Input
                value={schedules[selected]?.name || ""}
                onChange={(e) => {
                  const updated = [...schedules];
                  updated[selected].name = e.target.value;
                  setSchedules(updated);
                }}
                className="mt-2"
              />
            </div>
          </CardContent>
        </Card>

        {/* Timing */}
        <Card className="shadow-sm">
          <CardContent className="p-6 space-y-4">
            <Label className="text-slate-700 font-medium">Timing</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
              <div>
                <Label className="text-slate-600 text-sm">From</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="9:00 AM" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 24 }).map((_, i) => (
                      <SelectItem key={i} value={`${i}:00`}>
                        {`${i % 12 || 12}:00 ${i < 12 ? "AM" : "PM"}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-slate-600 text-sm">To</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="6:00 PM" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 24 }).map((_, i) => (
                      <SelectItem key={i} value={`${i}:00`}>
                        {`${i % 12 || 12}:00 ${i < 12 ? "AM" : "PM"}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-slate-600 text-sm">Timezone</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Eastern Time (US & Canada)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EST">
                      Eastern Time (US & Canada)
                    </SelectItem>
                    <SelectItem value="PST">
                      Pacific Time (US & Canada)
                    </SelectItem>
                    <SelectItem value="GMT">
                      Greenwich Mean Time (GMT)
                    </SelectItem>
                    <SelectItem value="IST">
                      India Standard Time (IST)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Days */}
        <Card className="shadow-sm">
          <CardContent className="p-6 space-y-4">
            <Label className="text-slate-700 font-medium">Days</Label>
            <div className="flex flex-wrap gap-4 mt-2">
              {[
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
                "Sunday",
              ].map((day) => (
                <div key={day} className="flex items-center space-x-2">
                  <Checkbox
                    id={day}
                    defaultChecked={[
                      "Monday",
                      "Tuesday",
                      "Wednesday",
                      "Thursday",
                      "Friday",
                    ].includes(day)}
                  />
                  <Label htmlFor={day} className="text-slate-600">
                    {day}
                  </Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-start">
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 rounded-lg"
            onClick={handleSave}
          >
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}
