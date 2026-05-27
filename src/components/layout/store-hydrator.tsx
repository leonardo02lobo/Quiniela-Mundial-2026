"use client";

import { useEffect } from "react";
import { usePredictionsStore } from "@/lib/store/predictions";

export function StoreHydrator() {
  useEffect(() => {
    usePredictionsStore.persist.rehydrate();
  }, []);
  return null;
}
