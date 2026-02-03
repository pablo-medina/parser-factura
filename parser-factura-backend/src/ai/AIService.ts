import { BaseAIClient } from "./clients/AIClient";
import { LMStudioClient } from "./clients/LMStudioClient";
import config from "../config";
import { logger } from "../utils/logger";

export class AIService {
  private client: BaseAIClient;

  constructor() {
    const provider = config.ai.provider.toLowerCase();
    
    switch (provider) {
      case "lmstudio":
        this.client = new LMStudioClient();
        break;
      default:
        throw new Error(`Proveedor de IA no soportado: ${provider}`);
    }

    logger.info(`Cliente de IA inicializado: ${provider}`);
  }

  getClient(): BaseAIClient {
    return this.client;
  }
}
