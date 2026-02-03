import { Router, Request, Response } from "express";
import multer from "multer";
import { AIService } from "../ai/AIService";
import { processDocument } from "../utils/documentProcessor";
import { buildFacturaPrompt } from "../utils/promptBuilder";
import { FacturaResponse } from "../types";
import { logger } from "../utils/logger";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });
const aiService = new AIService();

router.post("/procesar-factura", upload.single("documento"), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: "ERROR",
        motivo: "No se proporcionó ningún documento",
      } as FacturaResponse);
    }

    const { buffer, mimetype } = req.file;
    logger.info("Documento recibido para procesamiento", {
      mimetype,
      size: buffer.length,
    });

    // Procesar el documento (extraer texto si es PDF, o preparar imagen)
    const processedDoc = await processDocument(buffer, mimetype);

    // Construir el prompt
    const prompt = buildFacturaPrompt();

    // Enviar a la IA
    const aiClient = aiService.getClient();
    let aiResponse;
    
    if (processedDoc.text) {
      // Si es PDF con texto extraído, podemos enviarlo como texto
      // Pero para mantener consistencia, también lo enviamos como imagen si el modelo soporta vision
      aiResponse = await aiClient.processDocument(buffer, mimetype, prompt);
    } else if (processedDoc.imageBuffer) {
      // Si es una imagen, la enviamos directamente
      aiResponse = await aiClient.processDocument(processedDoc.imageBuffer, mimetype, prompt);
    } else {
      throw new Error("No se pudo procesar el documento");
    }

    // Parsear la respuesta de la IA
    let facturaData: FacturaResponse;
    try {
      // Limpiar la respuesta de posibles markdown o texto adicional
      let cleanedResponse = aiResponse.content.trim();
      
      // Remover markdown code blocks si existen
      if (cleanedResponse.startsWith("```")) {
        const lines = cleanedResponse.split("\n");
        lines.shift(); // Remover primera línea con ```
        if (lines[lines.length - 1].trim() === "```") {
          lines.pop(); // Remover última línea con ```
        }
        cleanedResponse = lines.join("\n").trim();
      }
      
      // Buscar el JSON en la respuesta
      const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleanedResponse = jsonMatch[0];
      }

      // Reemplazar valores undefined (como string) por null o eliminarlos
      // Primero, reemplazar "undefined" (sin comillas) por null
      cleanedResponse = cleanedResponse.replace(/:\s*undefined\s*([,}])/g, ': null$1');
      // También manejar undefined con comillas (aunque no debería pasar)
      cleanedResponse = cleanedResponse.replace(/:\s*"undefined"\s*([,}])/g, ': null$1');

      facturaData = JSON.parse(cleanedResponse) as FacturaResponse;
    } catch (parseError: any) {
      logger.error("Error al parsear respuesta de la IA:", {
        error: parseError.message,
        response: aiResponse.content.substring(0, 500),
      });
      return res.status(500).json({
        status: "ERROR",
        motivo: "Error al procesar la respuesta de la IA",
      } as FacturaResponse);
    }

    // Validar estructura básica
    if (!facturaData.status) {
      return res.status(500).json({
        status: "ERROR",
        motivo: "Respuesta de la IA inválida: falta campo status",
      } as FacturaResponse);
    }

    // Si hay items, validar que el importe total coincida
    if (facturaData.status === "OK" && facturaData.items && facturaData.items.length > 0) {
      const sumaItems = facturaData.items.reduce((sum, item) => sum + (item.importe || 0), 0);
      const importeTotal = facturaData.importe || 0;
      const diferencia = Math.abs(sumaItems - importeTotal);
      
      // Permitir pequeñas diferencias por redondeo (hasta 0.01)
      if (diferencia > 0.01) {
        logger.warn("Diferencia entre suma de items e importe total", {
          sumaItems,
          importeTotal,
          diferencia,
        });
        // Ajustar el importe total a la suma de items
        facturaData.importe = sumaItems;
      }
    }

    logger.info("Factura procesada exitosamente", {
      status: facturaData.status,
      tieneItems: facturaData.items ? facturaData.items.length : 0,
    });

    return res.json(facturaData);
  } catch (error: any) {
    logger.error("Error al procesar factura:", {
      error: error.message,
      stack: error.stack,
    });
    return res.status(500).json({
      status: "ERROR",
      motivo: `Error interno: ${error.message}`,
    } as FacturaResponse);
  }
});

export default router;
