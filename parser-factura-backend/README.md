# Parser Factura - Backend

Backend Node.js con TypeScript para procesamiento de facturas y comprobantes argentinos utilizando IA local (LM Studio).

## Características

- Procesamiento de imágenes y PDFs de facturas, recibos y tickets
- Integración con LM Studio para análisis con IA
- Arquitectura extensible para múltiples proveedores de IA
- Configuración externa (JSON)
- Logging con Winston
- CORS habilitado
- Validación y parsing de respuestas de IA

## Requisitos

- Node.js LTS 24.13.0 o superior
- LM Studio instalado y corriendo en `http://127.0.0.1:1234`
- Modelo de visión cargado en LM Studio

## Instalación

```bash
npm install
```

## Configuración

Edita el archivo `config.json`:

```json
{
  "server": {
    "port": 9401,
    "host": "0.0.0.0"
  },
  "cors": {
    "enabled": true,
    "origin": "*"
  },
  "ai": {
    "provider": "lmstudio",
    "lmstudio": {
      "baseUrl": "http://127.0.0.1:1234",
      "model": "nombre-del-modelo-aqui",
      "timeout": 30000,
      "maxTokens": 2000,
      "temperature": 0.1
    }
  },
  "logging": {
    "level": "info",
    "format": "json"
  }
}
```

**Importante**: Configura el nombre del modelo en `config.ai.lmstudio.model` según el modelo que tengas cargado en LM Studio.

## Uso

### Desarrollo

```bash
npm run dev
```

### Producción

```bash
npm run build
npm start
```

## Endpoints

### GET /status

Health check del servidor.

**Respuesta:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "service": "parser-factura-backend"
}
```

### POST /procesar-factura

Procesa un documento (imagen o PDF) y extrae la información de la factura.

**Request:**
- Content-Type: `multipart/form-data`
- Campo: `documento` (archivo)

**Respuesta exitosa:**
```json
{
  "status": "OK",
  "nombre": "Juan Pérez",
  "entidad": "Empresa S.A.",
  "fecha": "2024-01-15",
  "tipoComprobante": "Factura",
  "tipo_factura": "A",
  "nro_factura": "0001-00001234",
  "items": [
    {
      "cantidad": 1,
      "descripcion": "Producto X",
      "importe": 1000
    }
  ],
  "importe": 1000
}
```

**Respuesta con error:**
```json
{
  "status": "ERROR",
  "motivo": "El documento no es un comprobante de pago válido"
}
```

## Estructura del Proyecto

```
src/
├── ai/
│   ├── clients/
│   │   ├── AIClient.ts          # Clase abstracta base
│   │   └── LMStudioClient.ts    # Implementación LM Studio
│   └── AIService.ts             # Servicio de IA
├── routes/
│   ├── facturaRoutes.ts         # Endpoint de procesamiento
│   └── statusRoutes.ts          # Health check
├── types/
│   └── index.ts                 # Tipos TypeScript
├── utils/
│   ├── documentProcessor.ts     # Procesamiento de documentos
│   ├── logger.ts                # Configuración de Winston
│   └── promptBuilder.ts         # Construcción de prompts
├── config.ts                    # Cargador de configuración
└── index.ts                     # Punto de entrada
```

## Tipos de Comprobantes Soportados

- **Factura**: Facturas fiscales A, B, C
- **Recibo**: Recibos de servicios públicos (luz, gas, agua)
- **Ticket**: Tickets de farmacia, supermercado, etc.
- **Otros**: Otros tipos de comprobantes

## Extensibilidad

Para agregar otro proveedor de IA (ej: DeepSeek directo):

1. Crea una nueva clase que extienda `BaseAIClient`
2. Implementa el método `processDocument`
3. Agrega la configuración en `config.json`
4. Actualiza `AIService.ts` para incluir el nuevo proveedor

## Licencia

MIT

## Autor

Pablo Medina
