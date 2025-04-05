import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

// Set up a test environment variable
process.env.TEST_VAR = "test-value";

const env = createEnv({
  server: {
    TEST_VAR: z.string(),
  },
  runtimeEnv: {
    TEST_VAR: process.env.TEST_VAR,
  },
});

console.log("env:", env);
console.log("typeof env:", typeof env);
// env is an object, not a function
console.log("env.TEST_VAR:", env.TEST_VAR);
