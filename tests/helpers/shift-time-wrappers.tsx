import { ShiftTimeTool } from "@/components/tools/shift-time-tool";

export function AddTimeCalculator() {
  return <ShiftTimeTool sign={1} />;
}

export function SubtractTimeCalculator() {
  return <ShiftTimeTool sign={-1} />;
}
