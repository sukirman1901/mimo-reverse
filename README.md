# Kirman — MiMo Auto API tools

Tools buat pake **MiMo Auto** (Xiaomi's free AI model) lewat CLI atau OpenAI-compatible proxy.

## Prerequisites

- [Bun](https://bun.sh) runtime
- [MiMo Code](https://mimocode.ai) (buat dapet fingerprint)

## Install

```bash
# clone repo
git clone <repo-url> kirman
cd kirman

# pastiin fingerprint ada
cat ~/.local/share/mimocode/mimo-free-client
# kalo kosong, jalanin "mimo" dulu biar generate fingerprint
```

## Usage

### 1. CLI langsung

```bash
./mimo "pertanyaan lu"
./mimo stream "pertanyaan lu"   # streaming
./mimo jwt                       # liat JWT token
```

### 2. OpenAI-compatible proxy

```bash
bun mimo-proxy.ts
```

Proxy jalan di `http://localhost:8080/v1`.

| Config | Value |
|--------|-------|
| Base URL | `http://localhost:8080/v1` |
| API Key | `mimo-free` |
| Model | `mimo-auto` |

Contoh pake curl:

```bash
curl http://localhost:8080/v1/chat/completions \
  -H "authorization: Bearer mimo-free" \
  -H "content-type: application/json" \
  -d '{"model":"mimo-auto","messages":[{"role":"user","content":"halo"}]}'
```

Contoh pake OpenAI SDK:

```js
import OpenAI from "openai";
const client = new OpenAI({
  baseURL: "http://localhost:8080/v1",
  apiKey: "mimo-free",
});
const chat = await client.chat.completions.create({
  model: "mimo-auto",
  messages: [{ role: "user", content: "halo" }],
});
```

## Files

| File | Fungsi |
|------|--------|
| `mimo` | CLI script buat chat langsung |
| `mimo-proxy.ts` | OpenAI-compatible proxy server |

## How it works

1. **Fingerprint** — `SHA256(hostname|os|cpu|username)`, disimpan di `~/.local/share/mimocode/mimo-free-client`
2. **Bootstrap** — `POST /api/free-ai/bootstrap` dapetin JWT token (valid 1 jam)
3. **Chat** — `POST /api/free-ai/openai/chat` pake `Authorization: Bearer <jwt>` + `X-Mimo-Source: mimocode-cli-free`

> **Catatan:** Body chat WAJIB ada system prompt yang diawali `"You are MiMoCode, an interactive CLI tool that helps users with software engineering tasks."` — proxy handle ini otomatis.
