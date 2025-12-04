import { useState, useEffect, useCallback } from "react";
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
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";

import { scheduleApi } from "../services/scheduleApi";
import { toast } from "sonner";

export default function ScheduleManager({ campaignId }: { campaignId: string }) {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [selected, setSelected] = useState(0);
  const [loading, setLoading] = useState(true);
  const [typingTimer, setTypingTimer] = useState<any>(null);

  const selectedSchedule = schedules[selected];

  // -----------------------------------------
  // LOAD SCHEDULES FROM BACKEND
  // -----------------------------------------
  useEffect(() => {
    const load = async () => {
      const res = await scheduleApi.getSchedules(campaignId);
      setSchedules(res.data); // DO NOT auto create schedule
      setLoading(false);
    };
    load();
  }, [campaignId]);

  // -----------------------------------------
  // DEBOUNCE SAVE NAME ONLY
  // -----------------------------------------
  const debounceSaveName = useCallback(
    (newName: string) => {
      if (!selectedSchedule?._id) return;

      clearTimeout(typingTimer);
      const timer = setTimeout(async () => {
        await scheduleApi.updateSchedule(selectedSchedule._id, { name: newName });
      }, 2500);

      setTypingTimer(timer);
    },
    [selectedSchedule, typingTimer]
  );

  // -----------------------------------------
  // SAVE OR UPDATE LOGIC
  // -----------------------------------------
  const handleSave = async () => {
    const current = schedules[selected];

    if (current._id) {
      await scheduleApi.updateSchedule(current._id, current);
      toast.success("Schedule updated!");
    } else {
      const res = await scheduleApi.createSchedule({
        ...current,
        campaign_id: campaignId,
      });

      const updatedList = [...schedules];
      updatedList[selected] = res.data;
      setSchedules(updatedList);

      toast.success("Schedule created!");
    }
  };

  // -----------------------------------------
  // DELETE LOGIC
  // -----------------------------------------
  const handleDelete = async () => {
    if (!selectedSchedule?._id) {
      toast.warning("Cannot delete unsaved schedule");
      return;
    }

    if (!confirm("Are you sure you want to delete this schedule?")) return;

    await scheduleApi.deleteSchedule(selectedSchedule._id);

    const updated = schedules.filter((_, i) => i !== selected);

    if (!updated.length) {
      setSchedules([]);
      setSelected(0);
    } else {
      setSchedules(updated);
      setSelected(Math.max(0, selected - 1));
    }

    toast.success("Schedule deleted!");
  };

  // -----------------------------------------
  // UPDATE FIELD HELPER
  // -----------------------------------------
  const updateField = (field: string, value: any) => {
    const updated = [...schedules];
    updated[selected] = { ...updated[selected], [field]: value };
    setSchedules(updated);
  };

  // -----------------------------------------
  // EMPTY STATE
  // -----------------------------------------
  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-slate-500">
        Loading schedules...
      </div>
    );
  }

  if (!loading && schedules.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-slate-600">No schedules found</p>

        <Button
          className="bg-blue-600 text-white px-6 py-2"
          onClick={() => {
            const newSch = { name: "New Schedule", days: [] };
            setSchedules([newSch]);
            setSelected(0);
          }}
        >
          Create Schedule
        </Button>
      </div>
    );
  }

  // -----------------------------------------
  // TIME OPTIONS
  // -----------------------------------------
  const timeOptions = Array.from({ length: 24 }).map((_, i) => ({
    value: `${i}:00`,
    label: `${i % 12 || 12}:00 ${i < 12 ? "AM" : "PM"}`,
  }));

  const daysList = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-6 md:flex-row">
      {/* LEFT SIDEBAR */}
      <div className="w-full rounded-xl border bg-white p-4 shadow-sm md:w-1/3">
        <div className="space-y-4">

          {/* START DATE */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-slate-500" />
              <span className="font-medium text-slate-700">Start</span>
            </div>

            <Popover>
              <PopoverTrigger className="text-sm cursor-pointer text-blue-600">
                {selectedSchedule?.start_date
                  ? new Date(selectedSchedule.start_date).toDateString()
                  : "Select"}
              </PopoverTrigger>

              <PopoverContent>
                <Calendar
                  mode="single"
                  selected={
                    selectedSchedule?.start_date
                      ? new Date(selectedSchedule.start_date)
                      : undefined
                  }
                  onSelect={(date) => updateField("start_date", date)}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* END DATE */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-slate-500" />
              <span className="font-medium text-slate-700">End</span>
            </div>

            <Popover>
              <PopoverTrigger className="text-sm cursor-pointer text-blue-600">
                {selectedSchedule?.end_date
                  ? new Date(selectedSchedule.end_date).toDateString()
                  : "No end date"}
              </PopoverTrigger>

              <PopoverContent>
                <Calendar
                  mode="single"
                  selected={
                    selectedSchedule?.end_date
                      ? new Date(selectedSchedule.end_date)
                      : undefined
                  }
                  onSelect={(date) => updateField("end_date", date)}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="my-3 border-t" />

          {/* LIST OF SCHEDULES */}
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
              onClick={() => {
                setSchedules([...schedules, { name: `Schedule ${schedules.length + 1}`, days: [] }]);
                setSelected(schedules.length);
              }}
            >
              Add schedule
            </Button>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE CONTENT */}
      <div className="flex-1 space-y-6">

        {/* SCHEDULE NAME */}
        <Card className="shadow-sm">
          <CardContent className="space-y-4 p-6">
            <Label>Schedule Name</Label>
            <Input
              value={selectedSchedule?.name || ""}
              onChange={(e) => {
                updateField("name", e.target.value);
                debounceSaveName(e.target.value);
              }}
            />
          </CardContent>
        </Card>

        {/* TIMING */}
        <Card className="shadow-sm">
          <CardContent className="space-y-4 p-6">
            <Label>Timing</Label>

            <div className="mt-2 grid grid-cols-1 gap-4 md:grid-cols-3">

              {/* FROM TIME */}
              <div>
                <Label className="text-sm">From</Label>
                <Select
                  value={selectedSchedule?.from_time || undefined}
                  onValueChange={(v) => updateField("from_time", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeOptions.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* TO TIME */}
              <div>
                <Label className="text-sm">To</Label>
                <Select
                  value={selectedSchedule?.to_time || undefined}
                  onValueChange={(v) => updateField("to_time", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeOptions.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* TIMEZONE */}
              <div>
                <Label className="text-sm">Timezone</Label>
                <Select
                  value={selectedSchedule?.timezone || undefined}
                  onValueChange={(v) => updateField("timezone", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EST">EST</SelectItem>
                    <SelectItem value="PST">PST</SelectItem>
                    <SelectItem value="GMT">GMT</SelectItem>
                    <SelectItem value="IST">IST</SelectItem>
                  </SelectContent>
                </Select>
              </div>

            </div>
          </CardContent>
        </Card>

        {/* DAYS */}
        <Card className="shadow-sm">
          <CardContent className="space-y-4 p-6">
            <Label>Days</Label>

            <div className="flex flex-wrap gap-4">
              {daysList.map((day) => (
                <div key={day} className="flex items-center gap-2">
                  <Checkbox
                    checked={selectedSchedule?.days?.includes(day)}
                    onCheckedChange={(checked) => {
                      let updatedDays = [...(selectedSchedule?.days || [])];

                      if (checked) updatedDays.push(day);
                      else updatedDays = updatedDays.filter((d) => d !== day);

                      updateField("days", updatedDays);
                    }}
                  />
                  <Label>{day}</Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* SAVE + DELETE BUTTONS */}
        <div className="flex gap-4">
          <Button className="bg-blue-600 text-white px-8 py-2" onClick={handleSave}>
            {selectedSchedule?._id ? "Update" : "Save"}
          </Button>

          {selectedSchedule?._id && (
            <Button className="bg-red-600 text-white px-8 py-2" onClick={handleDelete}>
              Delete
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
