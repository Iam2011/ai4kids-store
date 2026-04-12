import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.resolve(__dirname, "../../.env"),
});

if (process.env.NODE_ENV === "production") {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET === "replace-with-a-long-random-string") {
    throw new Error("JWT_SECRET must be configured securely in production.");
  }

  if (process.env.ALLOW_MOCK_PAYMENTS === "true") {
    throw new Error("ALLOW_MOCK_PAYMENTS must be false in production.");
  }
}
