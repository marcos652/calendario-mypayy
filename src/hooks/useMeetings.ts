"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  createMeeting,
  updateMeeting,
  cancelMeeting,
  getMeetingById,
  listMeetingsForUser,
  CreateMeetingInput,
  UpdateMeetingInput,
} from "@/services/meetings.service";
import { Meeting } from "@/types/meeting";

export const useMeetings = () => {
  const { user } = useAuth();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);

  const loadMeetings = useCallback(async () => {
    if (!user) {
      setMeetings([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const data = await listMeetingsForUser(user.uid, user.email ?? undefined);
    setMeetings(data);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadMeetings();
  }, [loadMeetings]);

  const create = async (input: CreateMeetingInput) => {
    const id = await createMeeting(input);
    await loadMeetings();
    return id;
  };

  const update = async (input: UpdateMeetingInput) => {
    await updateMeeting(input);
    await loadMeetings();
  };

  const cancel = async (id: string, ownerId: string) => {
    await cancelMeeting(id, ownerId);
    await loadMeetings();
  };

  const getById = async (id: string) => {
    return getMeetingById(id);
  };

  return {
    meetings,
    loading,
    loadMeetings,
    create,
    update,
    cancel,
    getById,
  };
};
