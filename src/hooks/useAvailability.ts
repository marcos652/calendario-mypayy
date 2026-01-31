"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { updateAvailability } from "@/services/users.service";
import { AvailabilityRule } from "@/types/user";

export const useAvailability = () => {
  const { user, profile, refreshProfile } = useAuth();
  const [saving, setSaving] = useState(false);

  const saveAvailability = async (rules: AvailabilityRule[]) => {
    if (!user) {
      throw new Error("Not authenticated");
    }
    setSaving(true);
    await updateAvailability(user.uid, rules);
    await refreshProfile();
    setSaving(false);
  };

  return {
    availability: profile?.availability ?? [],
    saving,
    saveAvailability,
  };
};
