import { WebSocket } from "ws";
import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";

const PORT = 8765;
const [, , op, paramsArg] = process.argv;

if (!op) {
  console.error("usage: node cli.mjs <op> ['<json params>' | @path/to/params.json]");
  process.exit(1);
}

// Shell quoting of JSON containing spaces is unreliable across shells (confirmed broken on
// PowerShell 5.1, which strips/misparses embedded double quotes) — @file sidesteps it entirely.
let params = {};
if (paramsArg) {
  const raw = paramsArg.startsWith("@") ? readFileSync(paramsArg.slice(1), "utf8") : paramsArg;
  try {
    params = JSON.parse(raw);
  } catch (err) {
    console.error(`invalid JSON params: ${err.message}`);
    process.exit(1);
  }
}

const id = randomUUID();
const socket = new WebSocket(`ws://localhost:${PORT}/?role=caller`);

socket.on("open", () => {
  socket.send(JSON.stringify({ id, op, params }));
});

socket.on("message", (raw) => {
  const msg = JSON.parse(raw.toString());
  if (msg.id !== id) return;
  console.log(JSON.stringify(msg));
  socket.close();
  process.exit(msg.ok ? 0 : 1);
});

socket.on("error", (err) => {
  console.error(`relay unreachable: ${err.message}`);
  process.exit(1);
});
