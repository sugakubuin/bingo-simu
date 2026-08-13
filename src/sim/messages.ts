import type { SimInput, SimStats } from "../types";

export type WorkerRequest = {
  type: "run";
  input: SimInput;
  trials?: number;
  seed?: number;
};

export type WorkerResponse =
  | { type: "progress"; done: number; total: number }
  | { type: "done"; stats: SimStats }
  | { type: "error"; message: string };
