import pdfParse from "pdf-parse";
import { logger } from "./logger";

export interface ProcessedDocument {
  text?: string;
  imageBuffer?: Buffer;
  mimeType: string;
}

export async function processDocument(
  buffer: Buffer,
  mimeType: string
): Promise<ProcessedDocument> {
  if (mimeType === "application/pdf") {
    try {
      const data = await pdfParse(buffer);
      logger.info("PDF procesado correctamente", {
        pages: data.numpages,
        textLength: data.text.length,
      });
      return {
        text: data.text,
        mimeType,
      };
    } catch (error: any) {
      logger.error("Error al procesar PDF:", error);
      throw new Error(`Error al procesar PDF: ${error.message}`);
    }
  } else if (mimeType.startsWith("image/")) {
    logger.info("Imagen recibida para procesamiento", { mimeType });
    return {
      imageBuffer: buffer,
      mimeType,
    };
  } else {
    throw new Error(`Tipo de archivo no soportado: ${mimeType}`);
  }
}
