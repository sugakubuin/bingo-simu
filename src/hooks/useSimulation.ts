import { useEffect, useRef, useState } from "react";
import type { SimInput, SimStats } from "../types";
import type { WorkerRequest, WorkerResponse } from "../sim/messages";

export function useSimulation() {
  const workerRef = useRef<Worker | null>(null);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stats, setStats] = useState<SimStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  const run = (input: SimInput) => {
    workerRef.current?.terminate();
    const worker = new Worker(new URL("../sim/worker.ts", import.meta.url), {
      type: "module",
    });
    workerRef.current = worker;
    setRunning(true);
    setProgress(0);
    setError(null);
    worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
      const msg = event.data;
      if (msg.type === "progress") {
        setProgress(msg.done / msg.total);
      } else if (msg.type === "done") {
        setStats(msg.stats);
        setProgress(1);
        setRunning(false);
        worker.terminate();
        if (workerRef.current === worker) workerRef.current = null;
      } else if (msg.type === "error") {
        setError(msg.message);
        setRunning(false);
        worker.terminate();
        if (workerRef.current === worker) workerRef.current = null;
      }
    };
    worker.onerror = (err) => {
      setError(err.message || "シミュレーションに失敗しました");
      setRunning(false);
    };
    const req: WorkerRequest = { type: "run", input };
    worker.postMessage(req);
  };

  return { running, progress, stats, error, run };
}
