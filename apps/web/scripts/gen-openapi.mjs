import { execSync } from "node:child_process";

// Usage:
//   API_SPEC_URL=http://localhost:5167/swagger/v1/swagger.json npm run gen:openapi
// If you only have BACKEND_URL (e.g. http://localhost:5167/api), we will try to infer the spec url.

const specUrlFromEnv = process.env.API_SPEC_URL;
const backendUrl = process.env.BACKEND_URL;

function inferSpecUrl() {
  if (!backendUrl) return null;
  // BACKEND_URL usually ends with /api
  const base = backendUrl.replace(/\/+$/, "").replace(/\/+api$/, "");
  return `${base}/swagger/v1/swagger.json`;
}

const specUrl = specUrlFromEnv || inferSpecUrl();

if (!specUrl) {
  console.error(
    "Missing API_SPEC_URL (or BACKEND_URL). Example: API_SPEC_URL=http://localhost:5167/swagger/v1/swagger.json npm run gen:openapi"
  );
  process.exit(1);
}

const out = "src/lib/openapi/schema.d.ts";

console.log(`[openapi] Generating types from: ${specUrl}`);

execSync(`npx openapi-typescript "${specUrl}" -o ${out}`, {
  stdio: "inherit",
});

console.log(`[openapi] Done: ${out}`);
