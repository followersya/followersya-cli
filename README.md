# FollowersYA CLI

Command-line client for the [followersya.com](https://followersya.com) commerce API.

Source code and issue tracking: [github.com/followersya/followersya-cli](https://github.com/followersya/followersya-cli).
API documentation: [Developer portal](https://followersya.com/developers), [OpenAPI](https://followersya.com/openapi.json), and [MCP](https://followersya.com/mcp).

```bash
npm install -g followersya
followersya search "seguidores instagram"
```

## Commands

| Command | Auth | Description |
| --- | --- | --- |
| `search <query>` | none | Public catalog search (names, URLs, prices) |
| `details <query>` | `catalog:read` | Service tiers, pricing, delivery estimates |
| `status <order-number>` | `orders:read` | Order status lookup |
| `checkout '<json>'` | `orders:create-link` | Signed checkout link that preloads a customer's cart |

## Credentials

Set environment variables before authenticated commands:

```bash
export NOVA_CLIENT_ID=...
export NOVA_CLIENT_SECRET=...
```

Request a client pair at `info@followersya.com` — see the
[developer portal](https://followersya.com/developers) and
[auth.md](https://followersya.com/auth.md).

## Requirements

Node.js ≥ 18. No dependencies.

## Docker

```bash
docker run --rm followersya/followersya-cli search "seguidores instagram"
```

The image is published from the official FollowersYA account at
`docker.io/followersya/followersya-cli`.
