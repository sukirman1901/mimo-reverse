# MiMo Auto API tools

Tools buat pake **MiMo Auto**, model AI gratis dari Xiaomi, lewat CLI atau OpenAI-compatible proxy.

## Prerequisites

- [Bun](https://bun.sh) runtime
- [MiMo Code](https://mimocode.ai) — sekali jalanin aja biar generate fingerprint

## Install

```bash
git clone https://github.com/sukirman1901/mimo-reverse.git
cd mimo-reverse
```

Cek fingerprint udah ada:

```bash
cat ~/.local/share/mimocode/mimo-free-client
```

Kalo kosong, jalanin `mimo` dulu:

```bash
npx mimocode --version
# atau kalo pake binary
~/.mimocode/bin/mimo --version
```

## Usage

### CLI

```bash
./mimo "pertanyaan kamu"
./mimo stream "pertanyaan kamu"
./mimo jwt
```

### OpenAI-compatible proxy

```bash
bun mimo-proxy.ts
```

| Config | Value |
|--------|-------|
| Base URL | `http://localhost:8080/v1` |
| API Key | `mimo-free` |
| Model | `mimo-auto` |

```bash
curl http://localhost:8080/v1/chat/completions \
  -H "authorization: Bearer mimo-free" \
  -H "content-type: application/json" \
  -d '{"model":"mimo-auto","messages":[{"role":"user","content":"halo"}]}'
```

### OpenAI SDK

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
| `mimo` | CLI script chat |
| `mimo-proxy.ts` | Proxy OpenAI-compatible |

## How it works

- **Fingerprint** — hash `SHA256(hostname|os|cpu|username)` dari mesin kamu
- **Bootstrap** — `POST /api/free-ai/bootstrap` → dapet JWT (valid 1 jam)
- **Chat** — pake `Authorization: Bearer <jwt>` + `X-Mimo-Source: mimocode-cli-free`
