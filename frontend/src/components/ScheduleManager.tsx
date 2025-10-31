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
      <div className="flex h-64 items-center justify-center text-slate-500">
        Loading schedules...
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-6 md:flex-row">
      {/* LEFT SIDEBAR */}
      <div className="w-full rounded-xl border bg-white p-4 shadow-sm md:w-1/3">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-slate-500" />
              <span className="font-medium text-slate-700">Start</span>
            </div>
            <span className="cursor-pointer text-sm font-medium text-blue-600">Now</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-slate-500" />
              <span className="font-medium text-slate-700">End</span>
            </div>
            <span className="text-sm text-slate-500">No end date</span>
          </div>

          <div className="my-3 border-t" />

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
                  <CalendarDays className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-slate-800">{sch.name}</span>
                </div>
              </div>
            ))}
            <Button
              variant="outline"
              className="mt-2 w-full"
              onClick={() =>
                setSchedules([...schedules, { name: `Schedule ${schedules.length + 1}` }])
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
          <CardContent className="space-y-4 p-6">
            <div>
              <Label className="font-medium text-slate-700">Schedule Name</Label>
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
          <CardContent className="space-y-4 p-6">
            <Label className="font-medium text-slate-700">Timing</Label>
            <div className="mt-2 grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <Label className="text-sm text-slate-600">From</Label>
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
                <Label className="text-sm text-slate-600">To</Label>
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
                <Label className="text-sm text-slate-600">Timezone</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Eastern Time (US & Canada)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EST">Eastern Time (US & Canada)</SelectItem>
                    <SelectItem value="PST">Pacific Time (US & Canada)</SelectItem>
                    <SelectItem value="GMT">Greenwich Mean Time (GMT)</SelectItem>
                    <SelectItem value="IST">India Standard Time (IST)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Days */}
        <Card className="shadow-sm">
          <CardContent className="space-y-4 p-6">
            <Label className="font-medium text-slate-700">Days</Label>
            <div className="mt-2 flex flex-wrap gap-4">
              {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(
                (day) => (
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
                )
              )}
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-start">
          <Button
            className="rounded-lg bg-blue-600 px-8 py-2 text-white hover:bg-blue-700"
            onClick={handleSave}
          >
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}
