#!/usr/bin/env node
/**
 * followersya — CLI for the followersya.com commerce API.
 *
 * Zero dependencies (Node >= 18). Read-only catalog commands work without
 * credentials; authenticated MCP tools use OAuth2 client credentials from
 * NOVA_CLIENT_ID / NOVA_CLIENT_SECRET environment variables.
 */
const SITE = process.env.NOVA_SITE_URL || 'https://followersya.com';
const ISSUER = process.env.NOVA_ISSUER || 'https://api.followersya.com';

const arg = (name) => {
  const i = process.argv.indexOf(name);
  return i === -1 ? undefined : process.argv[i + 1];
};

async function getToken(scope) {
  const id = process.env.NOVA_CLIENT_ID;
  const secret = process.env.NOVA_CLIENT_SECRET;
  if (!id || !secret) {
    console.error('Set NOVA_CLIENT_ID and NOVA_CLIENT_SECRET (see https://followersya.com/developers)');
    process.exit(2);
  }
  const res = await fetch(`${ISSUER}/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'client_credentials', scope }),
  });
  if (!res.ok) {
    console.error(`token request failed: HTTP ${res.status}`);
    process.exit(1);
  }
  return (await res.json()).access_token;
}

async function mcp(tool, args, scope) {
  const token = await getToken(scope);
  const res = await fetch(`${ISSUER}/mcp`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: Date.now(), method: 'tools/call', params: { name: tool, arguments: args } }),
  });
  if (!res.ok) {
    console.error(`MCP call failed: HTTP ${res.status}`);
    process.exit(1);
  }
  const body = await res.json();
  if (body.error) {
    console.error(`MCP error: ${body.error.message ?? JSON.stringify(body.error)}`);
    process.exit(1);
  }
  const out = body.result?.content?.map((c) => c.text).join('\n') ?? JSON.stringify(body.result, null, 2);
  console.log(out);
}

async function search(query) {
  const res = await fetch(`${SITE}/wp-json/wc/store/v1/products?search=${encodeURIComponent(query)}&per_page=10`);
  if (!res.ok) {
    console.error(`search failed: HTTP ${res.status}`);
    process.exit(1);
  }
  const items = await res.json();
  if (!items.length) return console.log('no results');
  for (const p of items) {
    const price = p.prices?.price ? `${p.prices.currency_symbol}${p.prices.price}` : '?';
    console.log(`${p.name}\n  ${p.permalink}\n  ${price}`);
  }
}

const HELP = `followersya — commerce API CLI

Usage:
  followersya search <query>              Search the public service catalog (no auth)
  followersya details <query>             Service tiers & pricing (catalog:read)
  followersya status <order-number>       Order status (orders:read)
  followersya checkout <json-args>        Create signed checkout link (orders:create-link)
  followersya help                        This help

Credentials (authenticated commands):
  NOVA_CLIENT_ID / NOVA_CLIENT_SECRET     Request access: info@followersya.com
  Docs: https://followersya.com/developers`;

async function main() {
  const [cmd, ...rest] = process.argv.slice(2);

  switch (cmd) {
    case 'search':
      if (!rest[0]) {
        console.error('usage: followersya search <query>');
        process.exitCode = 2;
        return;
      }
      await search(rest.join(' '));
      break;
    case 'details':
      await mcp('get_service_details', { query: rest.join(' ') }, 'catalog:read');
      break;
    case 'status':
      if (!rest[0]) {
        console.error('usage: followersya status <order-number>');
        process.exitCode = 2;
        return;
      }
      await mcp('get_order_status', { order_number: rest[0] }, 'orders:read');
      break;
    case 'checkout': {
      let args = {};
      try {
        args = JSON.parse(rest.join(' ') || '{}');
      } catch {
        console.error('checkout args must be JSON');
        process.exitCode = 2;
        return;
      }
      await mcp('create_checkout_link', args, 'orders:create-link');
      break;
    }
    default:
      console.log(HELP);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
