import { readFileSync } from "fs";
import { join } from "path";
import { Config } from "./types";

let config: Config;

try {
  const configPath = join(__dirname, "../config.json");
  const configFile = readFileSync(configPath, "utf-8");
  config = JSON.parse(configFile);
} catch (error) {
  console.error("Error al cargar la configuración:", error);
  process.exit(1);
}

export default config;
