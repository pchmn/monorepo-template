import { defineConfig } from "@hey-api/openapi-ts";

export default defineConfig({
  client: "@hey-api/client-fetch",
  experimentalParser: true,
  input: "./swagger.json",
  output: "src/sdk/client",
});
