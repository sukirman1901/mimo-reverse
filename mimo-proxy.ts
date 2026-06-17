#!/usr/bin/env bun
import { readFileSync, writeFileSync, existsSync } from "fs";
import { homedir } from "os";

// config
const PORT = parseInt(process.env.PORT || "8080");
const API_KEY = process.env.API_KEY || "mimo-free";
const CONFIG_DIR = `${homedir()}/.local/share/mimocode`;
const FINGERPRINT_FILE = `${CONFIG_DIR}/mimo-free-client`;
const JWT_CACHE = `${CONFIG_DIR}/.jwt-cache`;
const JWT_EXPIRY_MS = 50 * 60 * 1000; // refresh 50 menit
const MIMO_API = "https://api.xiaomimimo.com";

let jwt = "";
let jwtTime = 0;

async function getJwt(): Promise<string> {
  if (jwt && Date.now() - jwtTime < JWT_EXPIRY_MS) return jwt;

  // try cache
  if (existsSync(JWT_CACHE)) {
    const cached = readFileSync(JWT_CACHE, "utf-8").trim();
    const [ts, token] = cached.split("|");
    if (token && Date.now() - parseInt(ts) < JWT_EXPIRY_MS) {
      jwt = token;
      jwtTime = parseInt(ts);
      return jwt;
    }
  }

  const fingerprint = readFileSync(FINGERPRINT_FILE, "utf-8").trim();
  const resp = await fetch(`${MIMO_API}/api/free-ai/bootstrap`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ client: fingerprint }),
  });
  const data: any = await resp.json();
  if (!data.jwt) throw new Error(`Bootstrap failed: ${JSON.stringify(data)}`);

  jwt = data.jwt;
  jwtTime = Date.now();
  writeFileSync(JWT_CACHE, `${jwtTime}|${jwt}`);
  return jwt;
}

function cors(res: Response) {
  res.headers.set("access-control-allow-origin", "*");
  return res;
}

type Handler = (req: Request) => Response | Promise<Response>;
const ROUTES: Record<string, Handler> = {
  "GET /v1/models": async () => {
    return Response.json({
      object: "list",
      data: [
        {
          id: "mimo-auto",
          object: "model",
          created: 1700000000,
          owned_by: "xiaomi",
        },
      ],
    });
  },
  "POST /v1/chat/completions": async (req) => {
    const auth = req.headers.get("authorization") || "";
    if (!auth.startsWith("Bearer ") || auth.slice(7) !== API_KEY) {
      return Response.json({ error: { message: "Invalid API key" } }, { status: 401 });
    }

    const body: any = await req.json();
    const { messages, stream, max_tokens = 128000, temperature = 0.7, ...rest } = body;

    if (!messages || !Array.isArray(messages)) {
      return Response.json({ error: { message: "messages is required" } }, { status: 400 });
    }

    // ensure system prompt has the required prefix
    let sysIdx = messages.findIndex((m: any) => m.role === "system");
    if (sysIdx === -1) {
      messages.unshift({
        role: "system",
        content: "You are MiMoCode, an interactive CLI tool that helps users with software engineering tasks.",
      });
    } else {
      const sys = messages[sysIdx].content;
      if (!sys.startsWith("You are MiMoCode")) {
        messages[sysIdx].content =
          "You are MiMoCode, an interactive CLI tool that helps users with software engineering tasks.\n" + sys;
      }
    }

    const token = await getJwt();
    const mimoBody: any = {
      model: "mimo-auto",
      max_tokens: max_tokens ?? 128000,
      temperature: temperature ?? 0.7,
      messages,
      ...rest,
    };
    if (stream) {
      mimoBody.stream = true;
      mimoBody.stream_options = { include_usage: true };
    }

    const upstream = await fetch(`${MIMO_API}/api/free-ai/openai/chat`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${token}`,
        "x-mimo-source": "mimocode-cli-free",
        "content-type": "application/json",
      },
      body: JSON.stringify(mimoBody),
    });

    if (!upstream.ok) {
      const err = await upstream.text();
      return Response.json(
        { error: { message: `Upstream error: ${upstream.status}`, detail: err } },
        { status: upstream.status }
      );
    }

    if (stream) {
      const headers = new Headers({
        "content-type": "text/event-stream",
        "cache-control": "no-cache",
        connection: "keep-alive",
        "x-accel-buffering": "no",
      });

      return new Response(
        new ReadableStream({
          async start(controller) {
            const reader = upstream.body!.getReader();
            const decoder = new TextDecoder();
            const encoder = new TextEncoder();

            try {
              while (true) {
                const { done, value } = await reader.read();
                if (done) {
                  controller.enqueue(encoder.encode("data: [DONE]\n\n"));
                  controller.close();
                  break;
                }
                const text = decoder.decode(value, { stream: true });
                // rewrite each SSE line
                const lines = text.split("\n");
                for (const line of lines) {
                  if (line.startsWith("data: ")) {
                    const data = line.slice(6);
                    if (data === "[DONE]") {
                      controller.enqueue(encoder.encode("data: [DONE]\n\n"));
                      continue;
                    }
                    try {
                      const parsed = JSON.parse(data);
                      const openaiChunk = {
                        id: parsed.id,
                        object: "chat.completion.chunk",
                        created: parsed.created,
                        model: "mimo-auto",
                        choices: [
                          {
                            index: 0,
                            delta: {
                              content: parsed.choices?.[0]?.delta?.content || null,
                              role: parsed.choices?.[0]?.delta?.role || null,
                            },
                            finish_reason: parsed.choices?.[0]?.finish_reason || null,
                          },
                        ],
                      };
                      controller.enqueue(encoder.encode(`data: ${JSON.stringify(openaiChunk)}\n\n`));
                    } catch {
                      controller.enqueue(encoder.encode(line + "\n"));
                    }
                  }
                }
              }
            } catch (e: any) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: e.message })}\n\n`));
              controller.close();
            }
          },
        }),
        { headers }
      );
    }

    // non-streaming
    const upstreamBody = await upstream.json();
    const choice = upstreamBody.choices?.[0];
    const openaiResp = {
      id: upstreamBody.id,
      object: "chat.completion",
      created: upstreamBody.created,
      model: "mimo-auto",
      choices: [
        {
          index: 0,
          message: {
            role: "assistant",
            content: choice?.message?.content || "",
          },
          finish_reason: choice?.finish_reason || "stop",
        },
      ],
      usage: upstreamBody.usage || null,
    };
    return Response.json(openaiResp);
  },
};

Bun.serve({
  port: PORT,
  async fetch(req) {
    if (req.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "access-control-allow-origin": "*",
          "access-control-allow-methods": "GET, POST, OPTIONS",
          "access-control-allow-headers": "authorization, content-type",
        },
      });
    }

    const url = new URL(req.url);
    const key = `${req.method} ${url.pathname}`;
    const handler = ROUTES[key];
    if (handler) {
      try {
        return cors(await handler(req));
      } catch (e: any) {
        return cors(Response.json({ error: { message: e.message } }, { status: 500 }));
      }
    }
    return cors(Response.json({ error: { message: "Not found" } }, { status: 404 }));
  },
});

console.log(`mimo-proxy running at http://localhost:${PORT}/v1`);
console.log(`API Key: ${API_KEY}`);
console.log(`Model: mimo-auto`);
