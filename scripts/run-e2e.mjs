import { spawn } from "node:child_process";
import net from "node:net";

const host = "127.0.0.1";
const port = 3000;
const startupTimeoutMs = 60_000;

const server = spawn(
  process.execPath,
  ["node_modules/next/dist/bin/next", "start", "--hostname", host, "--port", String(port)],
  {
    env: process.env,
    stdio: ["ignore", "pipe", "pipe"],
  },
);

let serverExited = false;

server.stdout.on("data", (chunk) => {
  process.stdout.write(`[next] ${chunk}`);
});

server.stderr.on("data", (chunk) => {
  process.stderr.write(`[next] ${chunk}`);
});

server.on("exit", () => {
  serverExited = true;
});

try {
  await waitForPort(host, port, startupTimeoutMs);

  const testExitCode = await runPlaywright();
  await stopServer();
  process.exit(testExitCode);
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  await stopServer();
  process.exit(1);
}

function runPlaywright() {
  return new Promise((resolve) => {
    const test = spawn(
      process.execPath,
      ["node_modules/@playwright/test/cli.js", "test"],
      {
        env: {
          ...process.env,
          PLAYWRIGHT_SKIP_WEBSERVER: "1",
        },
        stdio: "inherit",
      },
    );

    test.on("exit", (code) => {
      resolve(code ?? 1);
    });
  });
}

function waitForPort(targetHost, targetPort, timeoutMs) {
  const startedAt = Date.now();

  return new Promise((resolve, reject) => {
    const attempt = () => {
      if (serverExited) {
        reject(new Error("Next.js server exited before becoming ready."));
        return;
      }

      const socket = net.createConnection(targetPort, targetHost);

      socket.once("connect", () => {
        socket.end();
        resolve();
      });

      socket.once("error", () => {
        socket.destroy();

        if (Date.now() - startedAt > timeoutMs) {
          reject(new Error("Timed out waiting for Next.js server."));
          return;
        }

        setTimeout(attempt, 250);
      });
    };

    attempt();
  });
}

function stopServer() {
  return new Promise((resolve) => {
    if (serverExited) {
      resolve();
      return;
    }

    const forceKill = setTimeout(() => {
      if (!serverExited) {
        server.kill("SIGKILL");
      }
    }, 5_000);

    server.once("exit", () => {
      clearTimeout(forceKill);
      resolve();
    });

    server.kill("SIGTERM");
  });
}
