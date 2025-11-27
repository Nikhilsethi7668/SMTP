import { Request, Response } from "express";
import { CampaignSchedule } from "../models/CampaignScheduleModel.js";

// ✅ Create Schedule
export const createSchedule = async (req: Request, res: Response) => {
  try {
    const schedule = await CampaignSchedule.create(req.body);
    res.status(201).json(schedule);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// ✅ Get All Schedules (optionally filter by campaign)
export const getSchedules = async (req: Request, res: Response) => {
  try {
    const { campaign_id } = req.query;

    const filter: any = {};
    if (campaign_id) filter.campaign_id = campaign_id;

    const schedules = await CampaignSchedule.find(filter).sort({ createdAt: -1 });

    res.json(schedules);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// ✅ Get Single Schedule
export const getScheduleById = async (req: Request, res: Response) => {
  try {
    const schedule = await CampaignSchedule.findById(req.params.id);

    if (!schedule)
      return res.status(404).json({ error: "Schedule not found" });

    res.json(schedule);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// ✅ Update Schedule
export const updateSchedule = async (req: Request, res: Response) => {
  try {
    const schedule = await CampaignSchedule.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!schedule)
      return res.status(404).json({ error: "Schedule not found" });

    res.json(schedule);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// ✅ Delete Schedule
export const deleteSchedule = async (req: Request, res: Response) => {
  try {
    const schedule = await CampaignSchedule.findByIdAndDelete(req.params.id);

    if (!schedule)
      return res.status(404).json({ error: "Schedule not found" });

    res.json({ message: "Schedule deleted successfully" });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
