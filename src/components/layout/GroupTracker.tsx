"use client";

import { useEffect } from "react";
import { useJoinedGroups } from "@/hooks/useJoinedGroups";

export function GroupTracker({ groupCode, groupName }: { groupCode: string; groupName: string }) {
  const { addGroup } = useJoinedGroups();
  useEffect(() => {
    addGroup(groupCode, groupName);
  }, [groupCode, groupName]);
  return null;
}
