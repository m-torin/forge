import { beforeEach, describe, expect, it, vi } from "vitest";

import { keys } from "../keys";

// Skip original implementation testing since we're mocking it
describe("Rate Limit Keys", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("provides the correct environment variables", () => {
    const result = keys();

    expect(result).toEqual({
      UPSTASH_REDIS_REST_TOKEN: "test-upstash-redis-token",
      UPSTASH_REDIS_REST_URL: "https://test-upstash-redis-url.com",
    });
  });
});
