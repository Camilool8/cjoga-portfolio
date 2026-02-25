import { createClient } from "@supabase/supabase-js";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import logger from "./logger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPaths = [
  path.join(__dirname, "../.env"),
  path.join(__dirname, "../../.env"),
  path.join(__dirname, "../../.env.local"),
];

for (const envPath of envPaths) {
  if (fs.existsSync(envPath)) {
    logger.info(`Loading environment variables from ${envPath}`);
    dotenv.config({ path: envPath });
    break;
  }
}

const supabaseUrl =
  process.env.VITE_SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL;

const supabaseAnonKey =
  process.env.VITE_SUPABASE_ANON_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY;

let supabase;
try {
  logger.info(`Initializing Supabase client with URL: ${supabaseUrl}`);
  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
    },
  });
  logger.info("Supabase client initialized successfully");
} catch (error) {
  logger.error("Error initializing Supabase client:", error);
  throw new Error(`Failed to initialize Supabase client: ${error.message}`);
}

export const testSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase
      .from("posts")
      .select("count", { count: "exact", head: true });

    if (error) throw error;

    logger.info("Supabase connection test successful");
    return true;
  } catch (error) {
    logger.error("Supabase connection test failed:", error);
    return false;
  }
};

export { supabase };
