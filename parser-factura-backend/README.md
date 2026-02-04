# Parser Factura - Backend

Backend Node.js con TypeScript para procesamiento de facturas y comprobantes argentinos utilizando IA. Soporta múltiples proveedores: LM Studio (local) y DeepSeek (API).

## Características

- Procesamiento de imágenes y PDFs de facturas, recibos y tickets
- Integración con múltiples proveedores de IA:
  - **LM Studio**: IA local para procesamiento offline
  - **DeepSeek**: API de DeepSeek para procesamiento en la nube
- Arquitectura extensible para múltiples proveedores de IA
- Configuración externa (JSON)
- Variables de entorno para credenciales sensibles
- Logging con Winston
- CORS habilitado
- Validación y parsing de respuestas de IA

## Requisitos

### Para LM Studio
- Node.js LTS 24.13.0 o superior
- LM Studio instalado y corriendo en `http://127.0.0.1:1234`
- Modelo de visión cargado en LM Studio

### Para DeepSeek
- Node.js LTS 24.13.0 o superior
- Cuenta en DeepSeek y API key (obtener en https://www.deepseek.com/)

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
    },
    "deepseek": {
      "baseUrl": "https://api.deepseek.com",
      "model": "deepseek-chat",
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

### Configuración por Proveedor

#### LM Studio

1. Cambia `"provider": "lmstudio"` en `config.json`
2. Configura el nombre del modelo en `config.ai.lmstudio.model` según el modelo que tengas cargado en LM Studio
3. Asegúrate de que LM Studio esté corriendo en la URL configurada

#### DeepSeek

1. Cambia `"provider": "deepseek"` en `config.json`
2. Configura el modelo en `config.ai.deepseek.model` (por ejemplo: `"deepseek-chat"` o `"deepseek-vision"` para modelos con soporte de visión)
3. **Configura la API key mediante variable de entorno** (recomendado por seguridad):

   **Windows (cmd.exe):**
   ```cmd
   set DEEPSEEK_API_KEY=tu-api-key-real
   ```

   **Windows (PowerShell):**
   ```powershell
   $env:DEEPSEEK_API_KEY="tu-api-key-real"
   ```

   **Linux/Mac:**
   ```bash
   export DEEPSEEK_API_KEY=tu-api-key-real
   ```

   **Nota**: Si no defines la variable de entorno, el sistema intentará leer la API key de `config.json` (no recomendado por seguridad).

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
│   │   ├── LMStudioClient.ts    # Implementación LM Studio
│   │   └── DeepSeekClient.ts    # Implementación DeepSeek
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

Para agregar otro proveedor de IA:

1. Crea una nueva clase que extienda `BaseAIClient` (ver `DeepSeekClient.ts` como ejemplo)
2. Implementa el método `processDocument`
3. Agrega la configuración en `config.json` y en `types/index.ts`
4. Actualiza `AIService.ts` para incluir el nuevo proveedor en el switch

### Ejemplo: Agregar un nuevo proveedor

```typescript
// src/ai/clients/NuevoProveedorClient.ts
export class NuevoProveedorClient extends BaseAIClient {
  async processDocument(
    document: Buffer,
    mimeType: string,
    prompt: string
  ): Promise<AIClientResponse> {
    // Implementación aquí
  }
}
```

Luego agrega el caso en `AIService.ts`:

```typescript
case "nuevoproveedor":
  this.client = new NuevoProveedorClient();
  break;
```

## Licencia

MIT

## Autor

Pablo Medina
