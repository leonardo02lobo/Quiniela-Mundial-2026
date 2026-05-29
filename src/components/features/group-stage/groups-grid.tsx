"use client";

import { useState } from "react";
import { groupIds } from "@/data/tournament";
import type { GroupId } from "@/types/domain";
import { GroupCard } from "./group-card";

export interface GroupSelection {
  groupId: GroupId;
  teamId: string;
}

/**
 * Wraps the 12 group cards with shared tap-to-swap selection state.
 * Selection is transient UI state, so it lives in React (not the persisted store).
 */
export function GroupsGrid() {
  const [selected, setSelected] = useState<GroupSelection | null>(null);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {groupIds.map((id) => (
        <GroupCard
          key={id}
          groupId={id}
          selected={selected}
          setSelected={setSelected}
        />
      ))}
    </div>
  );
}
