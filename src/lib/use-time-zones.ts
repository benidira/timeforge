"use client";

import { useSyncExternalStore } from "react";
import { getAllTimeZones, getLocalTimeZone } from "@/lib/time";

const subscribe = () => () => {};

/** Browser time zone. Empty string during server rendering and hydration. */
export function useLocalTimeZone(): string {
  return useSyncExternalStore(subscribe, getLocalTimeZone, () => "");
}

let cache: string[] | null = null;
const NONE: string[] = [];
function getSnapshot(): string[] {
  return (cache ??= getAllTimeZones());
}

/** Full IANA list from the browser. Empty during server rendering and hydration. */
export function useAllTimeZones(): string[] {
  return useSyncExternalStore(subscribe, getSnapshot, () => NONE);
}
