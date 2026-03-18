"use client";

import { useEffect } from "react";
import { useJoinedGroups } from "@/hooks/useJoinedGroups";

export function GroupTracker({
  groupCode,
  groupName,
  sport,
  clubName,
}: {
  groupCode: string;
  groupName: string;
  sport?: string;
  clubName?: string | null;
}) {
  const { addGroup } = useJoinedGroups();
  useEffect(() => {
    addGroup(groupCode, groupName, sport ?? "TABLE_TENNIS", clubName ?? undefined);
  }, [groupCode, groupName, sport, clubName]);
  return null;
}
