import { WebSocketServer } from "ws";

const PORT = 8765;
const REQUEST_TIMEOUT_MS = 8000;

const wss = new WebSocketServer({ port: PORT });
let pluginSocket = null;
const pending = new Map(); // id -> { callerSocket, timeout }

function failPending(id, error) {
  const entry = pending.get(id);
  if (!entry) return;
  clearTimeout(entry.timeout);
  pending.delete(id);
  if (entry.callerSocket.readyState === entry.callerSocket.OPEN) {
    entry.callerSocket.send(JSON.stringify({ id, ok: false, error }));
  }
}

wss.on("connection", (socket, req) => {
  const role = new URL(req.url, "http://localhost").searchParams.get("role");

  if (role === "plugin") {
    pluginSocket = socket;
    console.log("plugin connected");
    socket.on("close", () => {
      if (pluginSocket === socket) pluginSocket = null;
      for (const id of [...pending.keys()]) failPending(id, "NO_PLUGIN_CONNECTED");
      console.log("plugin disconnected");
    });
    socket.on("message", (raw) => {
      let msg;
      try {
        msg = JSON.parse(raw.toString());
      } catch {
        return;
      }
      const entry = pending.get(msg.id);
      if (!entry) return;
      clearTimeout(entry.timeout);
      pending.delete(msg.id);
      if (entry.callerSocket.readyState === entry.callerSocket.OPEN) {
        entry.callerSocket.send(JSON.stringify(msg));
      }
    });
    return;
  }

  // caller (cli.mjs)
  socket.on("message", (raw) => {
    let msg;
    try {
      msg = JSON.parse(raw.toString());
    } catch {
      return;
    }
    if (!pluginSocket || pluginSocket.readyState !== pluginSocket.OPEN) {
      socket.send(JSON.stringify({ id: msg.id, ok: false, error: "NO_PLUGIN_CONNECTED" }));
      return;
    }
    const timeout = setTimeout(() => failPending(msg.id, "TIMEOUT"), REQUEST_TIMEOUT_MS);
    pending.set(msg.id, { callerSocket: socket, timeout });
    pluginSocket.send(JSON.stringify(msg));
  });
});

console.log(`relay listening on ws://localhost:${PORT}`);
