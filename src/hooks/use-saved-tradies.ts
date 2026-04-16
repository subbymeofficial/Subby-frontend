// Hook: useSavedTradies
// Persists saved contractor cards to localStorage so builders can quickly
// re-find tradies they've previously worked with or bookmarked.

import { useState, useCallback } from "react";

const STORAGE_KEY = "subby_saved_tradies";

export interface SavedTradie {
  id: string;
  name: string;
  trade: string;
  location: string;
  hourlyRate?: number;
  avatar?: string;
  savedAt: string;
}

function loadSaved(): SavedTradie[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SavedTradie[]) : [];
  } catch {
    return [];
  }
}

export function useSavedTradies() {
  const [saved, setSaved] = useState<SavedTradie[]>(loadSaved);

  const isSaved = useCallback(
    (id: string) => saved.some((s) => s.id === id),
    [saved]
  );

  const toggle = useCallback(
    (contractor: {
      _id?: string;
      id?: string;
      name: string;
      trade?: string;
      location?: string;
      hourlyRate?: number;
      profileImage?: { url: string };
      avatar?: string;
    }) => {
      const id = String(contractor._id || contractor.id || "");
      setSaved((prev) => {
        const exists = prev.some((s) => s.id === id);
        const next: SavedTradie[] = exists
          ? prev.filter((s) => s.id !== id)
          : [
              ...prev,
              {
                id,
                name: contractor.name,
                trade: contractor.trade ?? "",
                location: contractor.location ?? "",
                hourlyRate: contractor.hourlyRate,
                avatar:
                  contractor.profileImage?.url || contractor.avatar || undefined,
                savedAt: new Date().toISOString(),
              },
            ];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        return next;
      });
    },
    []
  );

  const remove = useCallback((id: string) => {
    setSaved((prev) => {
      const next = prev.filter((s) => s.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return { saved, isSaved, toggle, remove };
}
