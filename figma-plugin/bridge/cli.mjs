import { WebSocket } from "ws";
import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";

const PORT = 8765;

function readJsonArg(arg, label) {
  const raw = arg.startsWith("@") ? readFileSync(arg.slice(1), "utf8") : arg;
  try {
    return JSON.parse(raw);
  } catch (err) {
    console.error(`invalid JSON ${label}: ${err.message}`);
    process.exit(1);
  }
}

// One request, wait for its matching response, resolve/reject.
function sendOne(socket, op, params) {
  const id = randomUUID();
  return new Promise((resolve, reject) => {
    const onMessage = (raw) => {
      const msg = JSON.parse(raw.toString());
      if (msg.id !== id) return;
      socket.off("message", onMessage);
      resolve(msg);
    };
    socket.on("message", onMessage);
    socket.send(JSON.stringify({ id, op, params }));
  });
}

async function main() {
  const [, , first, second] = process.argv;

  if (!first) {
    console.error(
      "usage:\n" +
      "  node cli.mjs <op> ['<json params>' | '@path/to/params.json']\n" +
      "  node cli.mjs --batch '@path/to/ops.json'   # ops.json: [{ \"op\": \"...\", \"params\": {...} }, ...]\n" +
      "Prefer --batch for any multi-step task — one connection, one process, one tool call " +
      "instead of one per op."
    );
    process.exit(1);
  }

  const isBatch = first === "--batch";
  if (isBatch && !second) {
    console.error("--batch requires a path: node cli.mjs --batch '@path/to/ops.json'");
    process.exit(1);
  }

  const requests = isBatch
    ? readJsonArg(second, "batch file")
    : [{ op: first, params: second ? readJsonArg(second, "params") : {} }];

  const socket = new WebSocket(`ws://localhost:${PORT}/?role=caller`);
  await new Promise((resolve, reject) => {
    socket.on("open", resolve);
    socket.on("error", (err) => reject(new Error(`relay unreachable: ${err.message}`)));
  });

  const results = [];
  let allOk = true;
  for (const { op, params } of requests) {
    const msg = await sendOne(socket, op, params || {});
    results.push(msg);
    if (!msg.ok) allOk = false;
  }

  socket.close();
  console.log(isBatch ? JSON.stringify(results) : JSON.stringify(results[0]));
  process.exit(allOk ? 0 : 1);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
