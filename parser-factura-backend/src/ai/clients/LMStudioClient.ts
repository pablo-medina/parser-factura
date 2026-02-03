import axios, { AxiosInstance } from "axios";
import { BaseAIClient } from "./AIClient";
import { AIClientResponse } from "../../types";
import config from "../../config";
import { logger } from "../../utils/logger";

export class LMStudioClient extends BaseAIClient {
  private client: AxiosInstance;
  private model: string;

  constructor() {
    super();
    const lmConfig = config.ai.lmstudio;
    if (!lmConfig.model) {
      throw new Error("El modelo de LM Studio no está configurado en config.json");
    }
    this.client = axios.create({
      baseURL: lmConfig.baseUrl,
      timeout: lmConfig.timeout,
    });
    this.model = lmConfig.model;
  }

  async processDocument(
    document: Buffer,
    mimeType: string,
    prompt: string
  ): Promise<AIClientResponse> {
    try {
      // Convertir el documento a base64 correctamente
      const base64Document = document.toString("base64");
      
      // Validar que el base64 sea válido (no vacío)
      if (!base64Document || base64Document.length === 0) {
        throw new Error("El documento está vacío o no se pudo codificar en base64");
      }
      
      // Determinar el tipo de contenido según el mimeType
      // LM Studio soporta tanto imágenes como PDFs, usar el mimeType correcto
      let dataUrl: string;
      if (mimeType.startsWith("image/") || mimeType === "application/pdf") {
        // Usar el mimeType original del archivo para el data URL
        dataUrl = `data:${mimeType};base64,${base64Document}`;
      } else {
        throw new Error(`Tipo de archivo no soportado: ${mimeType}`);
      }

      // LM Studio API v1: input debe ser un array de objetos con type "text" o "image"
      // Según la documentación, el tipo debe ser "text" (no "message") para texto
      const requestBody = {
        model: this.model,
        input: [
          {
            type: "text",
            content: prompt,
          },
          {
            type: "image",
            data_url: dataUrl,
          },
        ],
        temperature: config.ai.lmstudio.temperature,
        max_output_tokens: config.ai.lmstudio.maxTokens,
      };

      logger.info("Enviando solicitud a LM Studio", {
        model: this.model,
        mimeType,
        base64Length: base64Document.length,
        dataUrlLength: dataUrl.length,
        dataUrlPreview: dataUrl.substring(0, 100) + "...",
      });

      const response = await this.client.post("/api/v1/chat", requestBody);

      logger.info("Respuesta completa de LM Studio", {
        data: JSON.stringify(response.data).substring(0, 500),
      });

      // LM Studio API v1 devuelve la respuesta en response.data.output como array
      // Cada item puede ser { type: "message", content: string } u otros tipos
      let content = "";
      
      if (response.data?.output && Array.isArray(response.data.output)) {
        // Buscar el primer item de tipo "message" en el array output
        const messageItem = response.data.output.find(
          (item: any) => item.type === "message"
        );
        
        if (messageItem && messageItem.content) {
          content = messageItem.content;
        } else {
          logger.error("No se encontró mensaje en la respuesta de LM Studio", {
            output: JSON.stringify(response.data.output),
          });
          throw new Error("Respuesta inválida de LM Studio: no se encontró mensaje en output");
        }
      } else {
        logger.error("Formato de respuesta inválido de LM Studio", {
          responseData: JSON.stringify(response.data),
        });
        throw new Error("Respuesta inválida de LM Studio: falta campo 'output' o no es un array");
      }

      if (!content) {
        throw new Error("Respuesta vacía de LM Studio");
      }

      logger.info("Respuesta recibida de LM Studio", {
        length: content.length,
      });

      return { content };
    } catch (error: any) {
      // Mejorar el logging de errores para ver la respuesta completa
      if (error.response) {
        logger.error("Error de respuesta de LM Studio:", {
          status: error.response.status,
          statusText: error.response.statusText,
          data: JSON.stringify(error.response.data),
        });
        throw new Error(`Error en LM Studio (${error.response.status}): ${JSON.stringify(error.response.data)}`);
      } else if (error.request) {
        logger.error("Error de conexión con LM Studio:", {
          message: error.message,
        });
        throw new Error(`Error de conexión con LM Studio: ${error.message}`);
      } else {
        logger.error("Error al procesar documento con LM Studio:", {
          error: error.message,
          stack: error.stack,
        });
        throw new Error(`Error en LM Studio: ${error.message}`);
      }
    }
  }
}
