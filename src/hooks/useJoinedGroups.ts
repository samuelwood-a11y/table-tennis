"use client";

import { useEffect, useState } from "react";

export type JoinedGroup = {
  code: string;
  name: string;
  lastAccessed: number; // timestamp
};

const STORAGE_KEY = "tt_joined_groups";

export function useJoinedGroups() {
  const [groups, setGroups] = useState<JoinedGroup[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setGroups(JSON.parse(raw));
    } catch {}
  }, []);

  function addGroup(code: string, name: string) {
    setGroups((prev) => {
      const filtered = prev.filter((g) => g.code !== code);
      const updated = [{ code, name, lastAccessed: Date.now() }, ...filtered].slice(0, 10);
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)); } catch {}
      return updated;
    });
  }

  function touchGroup(code: string) {
    setGroups((prev) => {
      const group = prev.find((g) => g.code === code);
      if (!group) return prev;
      const updated = [
        { ...group, lastAccessed: Date.now() },
        ...prev.filter((g) => g.code !== code),
      ];
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)); } catch {}
      return updated;
    });
  }

  function removeGroup(code: string) {
    setGroups((prev) => {
      const updated = prev.filter((g) => g.code !== code);
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)); } catch {}
      return updated;
    });
  }

  return { groups, addGroup, touchGroup, removeGroup };
}
