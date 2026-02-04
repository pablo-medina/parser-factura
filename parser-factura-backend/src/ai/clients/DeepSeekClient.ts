import axios, { AxiosInstance } from "axios";
import { BaseAIClient } from "./AIClient";
import { AIClientResponse } from "../../types";
import config from "../../config";
import { logger } from "../../utils/logger";

const DEEPSEEK_API_KEY_ENV = "DEEPSEEK_API_KEY";

export class DeepSeekClient extends BaseAIClient {
  private client: AxiosInstance;
  private model: string;
  private apiKey: string;

  constructor() {
    super();
    const deepseekConfig = config.ai.deepseek;
    if (!deepseekConfig.model) {
      throw new Error("El modelo de DeepSeek no está configurado en config.json");
    }
    
    // Leer la API key desde variable de entorno o config.json (fallback)
    const apiKey = process.env[DEEPSEEK_API_KEY_ENV] || deepseekConfig.apiKey;
    if (!apiKey) {
      throw new Error(
        `La API key de DeepSeek no está configurada. ` +
        `Define la variable de entorno ${DEEPSEEK_API_KEY_ENV} o configúrala en config.json`
      );
    }
    
    this.client = axios.create({
      baseURL: deepseekConfig.baseUrl || "https://api.deepseek.com",
      timeout: deepseekConfig.timeout || 30000,
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    });
    this.model = deepseekConfig.model;
    this.apiKey = apiKey;
  }

  async processDocument(
    document: Buffer,
    mimeType: string,
    prompt: string
  ): Promise<AIClientResponse> {
    try {
      // Convertir el documento a base64
      const base64Document = document.toString("base64");
      
      // Validar que el base64 sea válido (no vacío)
      if (!base64Document || base64Document.length === 0) {
        throw new Error("El documento está vacío o no se pudo codificar en base64");
      }
      
      // Determinar el tipo de contenido según el mimeType
      let imageUrl: string;
      if (mimeType.startsWith("image/")) {
        // Para imágenes, usar el formato data URL
        imageUrl = `data:${mimeType};base64,${base64Document}`;
      } else if (mimeType === "application/pdf") {
        // DeepSeek puede no soportar PDFs directamente, convertir a imagen si es necesario
        // Por ahora, tratamos PDFs como imágenes (requiere que el modelo soporte vision)
        imageUrl = `data:${mimeType};base64,${base64Document}`;
      } else {
        throw new Error(`Tipo de archivo no soportado: ${mimeType}`);
      }

      // DeepSeek API usa formato similar a OpenAI Chat Completions
      // Para vision, usamos el formato de mensajes con contenido multimodal
      const requestBody = {
        model: this.model,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: prompt,
              },
              {
                type: "image_url",
                image_url: {
                  url: imageUrl,
                },
              },
            ],
          },
        ],
        temperature: config.ai.deepseek.temperature || 0.1,
        max_tokens: config.ai.deepseek.maxTokens || 2000,
      };

      logger.info("Enviando solicitud a DeepSeek", {
        model: this.model,
        mimeType,
        base64Length: base64Document.length,
        imageUrlLength: imageUrl.length,
        imageUrlPreview: imageUrl.substring(0, 100) + "...",
      });

      const response = await this.client.post("/v1/chat/completions", requestBody);

      logger.info("Respuesta completa de DeepSeek", {
        data: JSON.stringify(response.data).substring(0, 500),
      });

      // DeepSeek API devuelve la respuesta en response.data.choices[0].message.content
      let content = "";
      
      if (response.data?.choices && Array.isArray(response.data.choices) && response.data.choices.length > 0) {
        const firstChoice = response.data.choices[0];
        if (firstChoice.message?.content) {
          content = firstChoice.message.content;
        } else {
          logger.error("No se encontró contenido en la respuesta de DeepSeek", {
            choice: JSON.stringify(firstChoice),
          });
          throw new Error("Respuesta inválida de DeepSeek: no se encontró contenido en la respuesta");
        }
      } else {
        logger.error("Formato de respuesta inválido de DeepSeek", {
          responseData: JSON.stringify(response.data),
        });
        throw new Error("Respuesta inválida de DeepSeek: falta campo 'choices' o está vacío");
      }

      if (!content) {
        throw new Error("Respuesta vacía de DeepSeek");
      }

      logger.info("Respuesta recibida de DeepSeek", {
        length: content.length,
      });

      return { content };
    } catch (error: any) {
      // Mejorar el logging de errores
      if (error.response) {
        logger.error("Error de respuesta de DeepSeek:", {
          status: error.response.status,
          statusText: error.response.statusText,
          data: JSON.stringify(error.response.data),
        });
        throw new Error(`Error en DeepSeek (${error.response.status}): ${JSON.stringify(error.response.data)}`);
      } else if (error.request) {
        logger.error("Error de conexión con DeepSeek:", {
          message: error.message,
        });
        throw new Error(`Error de conexión con DeepSeek: ${error.message}`);
      } else {
        logger.error("Error al procesar documento con DeepSeek:", {
          error: error.message,
          stack: error.stack,
        });
        throw new Error(`Error en DeepSeek: ${error.message}`);
      }
    }
  }
}
