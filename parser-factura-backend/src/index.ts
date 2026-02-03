import express from "express";
import cors from "cors";
import config from "./config";
import { logger } from "./utils/logger";
import statusRoutes from "./routes/statusRoutes";
import facturaRoutes from "./routes/facturaRoutes";

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS
if (config.cors.enabled) {
  app.use(
    cors({
      origin: config.cors.origin,
      credentials: true,
    })
  );
  logger.info("CORS habilitado", { origin: config.cors.origin });
}

// Routes
app.use("/", statusRoutes);
app.use("/", facturaRoutes);

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error("Error no manejado:", {
    error: err.message,
    stack: err.stack,
  });
  res.status(500).json({
    status: "ERROR",
    motivo: "Error interno del servidor",
  });
});

// Start server
const PORT = config.server.port;
const HOST = config.server.host;

app.listen(PORT, HOST, () => {
  logger.info(`Servidor iniciado en http://${HOST}:${PORT}`);
  logger.info(`Health check disponible en http://${HOST}:${PORT}/status`);
  logger.info(`Endpoint de procesamiento disponible en http://${HOST}:${PORT}/procesar-factura`);
});
