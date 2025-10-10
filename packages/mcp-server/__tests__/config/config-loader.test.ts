import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import { loadConfig } from '../../src/config';

const ENV = process.env;

describe('loadConfig', () => {
  beforeEach(() => {
    process.env = { ...ENV };
    delete process.env.MCP_TRANSPORTS;
    delete process.env.MCP_TRANSPORT;
    delete process.env.MCP_HTTP_PORT;
    delete process.env.MCP_ENABLE_SSE;
    delete process.env.MCP_LOG_LEVEL;
    delete process.env.MCP_SERVER_NAME;
    delete process.env.MCP_SERVER_VERSION;
  });
  afterEach(() => {
    process.env = ENV;
  });

  test('returns defaults when no env provided', () => {
    const cfg = loadConfig({});
    expect(cfg.serverName).toBeTruthy();
    expect(cfg.transports.length).toBeGreaterThan(0);
    expect(typeof cfg.httpPort).toBe('number');
  });

  test('parses transports from comma-separated env', () => {
    process.env.MCP_TRANSPORTS = 'stdio, http, stdio';
    const cfg = loadConfig({});
    expect(new Set(cfg.transports)).toEqual(new Set(['stdio', 'http']));
  });

  test('throws for unsupported transport', () => {
    process.env.MCP_TRANSPORTS = 'foo,stdio';
    expect(() => loadConfig({})).toThrow(/Unsupported MCP transport/i);
  });

  test('parses boolean flags in various forms', () => {
    process.env.MCP_ENABLE_SSE = 'yes';
    const yesCfg = loadConfig({});
    expect(yesCfg.enableSse).toBeTruthy();

    process.env.MCP_ENABLE_SSE = 'off';
    const noCfg = loadConfig({});
    expect(noCfg.enableSse).toBeFalsy();
  });

  test('throws for invalid boolean', () => {
    process.env.MCP_ENABLE_SSE = 'maybe';
    expect(() => loadConfig({})).toThrow(/Invalid boolean value/i);
  });

  test('parses http port and throws on invalid', () => {
    process.env.MCP_HTTP_PORT = '4001';
    const cfg = loadConfig({});
    expect(cfg.httpPort).toBe(4001);

    process.env.MCP_HTTP_PORT = 'abc';
    expect(() => loadConfig({})).toThrow(/Invalid integer value/i);
  });

  test('validates log level', () => {
    process.env.MCP_LOG_LEVEL = 'DEBUG';
    const cfg = loadConfig({});
    expect(cfg.logLevel).toBe('debug');

    process.env.MCP_LOG_LEVEL = 'verbose';
    expect(() => loadConfig({})).toThrow();
  });
});
