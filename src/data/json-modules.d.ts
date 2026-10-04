declare module "@/data/formats.json" {
  import type { TimeFormat } from "@/lib/pseo/types";
  const value: TimeFormat[];
  export default value;
}

declare module "@/data/hubs.json" {
  import type { HubCity } from "@/lib/pseo/types";
  const value: HubCity[];
  export default value;
}

declare module "@/data/cron-presets.json" {
  import type { CronPreset } from "@/lib/pseo/types";
  const value: CronPreset[];
  export default value;
}

declare module "@/data/cities.json" {
  import type { CityEntry } from "@/lib/pseo/types";
  const value: CityEntry[];
  export default value;
}
