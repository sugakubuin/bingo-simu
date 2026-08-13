/// <reference lib="webworker" />
import { runSimulation } from "./stats";
import type { WorkerRequest, WorkerResponse } from "./messages";

self.onmessage = (event: MessageEvent<WorkerRequest>) => {
  const msg = event.data;
  if (msg.type !== "run") return;
  try {
    const stats = runSimulation(msg.input, {
      trials: msg.trials,
      seed: msg.seed,
      onProgress: (done, total) => {
        const res: WorkerResponse = { type: "progress", done, total };
        self.postMessage(res);
      },
    });
    const res: WorkerResponse = { type: "done", stats };
    self.postMessage(res);
  } catch (err) {
    const res: WorkerResponse = {
      type: "error",
      message: err instanceof Error ? err.message : String(err),
    };
    self.postMessage(res);
  }
};
