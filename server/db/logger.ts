import { getDb } from "./schema.js";
import type { Response } from "express";

const sseClients: Set<Response> = new Set();

export function addSseClient(res: Response) {
  sseClients.add(res);
  res.on("close", () => sseClients.delete(res));
}

export function broadcastLog(agentId: string, level: string, message: string, data?: unknown) {
  const db = getDb();
  const dataStr = data ? JSON.stringify(data) : null;
  db.prepare("INSERT INTO logs (agent_id, level, message, data) VALUES (?, ?, ?, ?)").run(agentId, level, message, dataStr);

  const logEntry = {
    agent_id: agentId,
    level,
    message,
    data: data || null,
    created_at: new Date().toISOString(),
  };

  const payload = `data: ${JSON.stringify(logEntry)}\n\n`;
  Array.from(sseClients).forEach(client => {
    try {
      client.write(payload);
    } catch {
      sseClients.delete(client);
    }
  });
}

export function setAgentStatus(agentId: string, status: string) {
  const db = getDb();
  db.prepare("UPDATE agents SET status = ?, last_run_at = datetime('now') WHERE id = ?").run(status, agentId);

  const statusEntry = {
    type: "agent_status",
    agent_id: agentId,
    status,
    created_at: new Date().toISOString(),
  };
  const payload = `data: ${JSON.stringify(statusEntry)}\n\n`;
  Array.from(sseClients).forEach(client => {
    try {
      client.write(payload);
    } catch {
      sseClients.delete(client);
    }
  });
}
