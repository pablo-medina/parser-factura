import { AIClient, AIClientResponse } from "../../types";

export abstract class BaseAIClient implements AIClient {
  abstract processDocument(
    document: Buffer,
    mimeType: string,
    prompt: string
  ): Promise<AIClientResponse>;
}
