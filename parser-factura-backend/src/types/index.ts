export interface FacturaItem {
  cantidad: number;
  descripcion: string;
  importe: number;
}

export interface FacturaResponse {
  status: "OK" | "ERROR";
  motivo?: string;
  nombre?: string;
  entidad?: string;
  fecha?: string;
  tipoComprobante?: "Factura" | "Recibo" | "Ticket" | "Otros";
  tipo_factura?: "A" | "B" | "C";
  nro_factura?: string;
  items?: FacturaItem[];
  importe?: number;
}

export interface Config {
  server: {
    port: number;
    host: string;
  };
  cors: {
    enabled: boolean;
    origin: string;
  };
  ai: {
    provider: string;
    lmstudio: {
      baseUrl: string;
      model: string;
      timeout: number;
      maxTokens: number;
      temperature: number;
    };
  };
  logging: {
    level: string;
    format: string;
  };
}

export interface AIClientResponse {
  content: string;
}

export interface AIClient {
  processDocument(document: Buffer, mimeType: string, prompt: string): Promise<AIClientResponse>;
}
