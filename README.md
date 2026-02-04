# Parser Factura

Sistema completo para procesamiento de facturas y comprobantes argentinos utilizando IA. Soporta múltiples proveedores: LM Studio (local) y DeepSeek (API).

## Descripción

Parser Factura es una aplicación full-stack que permite procesar y extraer información de facturas, recibos y tickets argentinos utilizando modelos de IA. El sistema está compuesto por un backend Node.js/TypeScript y un frontend Angular 21. Soporta tanto procesamiento local (LM Studio) como en la nube (DeepSeek).

## Características Principales

- ✅ Procesamiento de imágenes (JPG, PNG) y PDFs
- ✅ Extracción automática de datos de comprobantes
- ✅ Soporte para múltiples tipos de comprobantes:
  - Facturas fiscales (A, B, C)
  - Recibos de servicios públicos (luz, gas, agua)
  - Tickets de farmacia, supermercado, etc.
- ✅ Interfaz web moderna y responsive
- ✅ Captura de fotos desde dispositivos móviles
- ✅ Arquitectura extensible para múltiples proveedores de IA
- ✅ Configuración externa sin hardcodeo

## Estructura del Proyecto

```
parser-factura/
├── parser-factura-backend/    # Backend Node.js + TypeScript
│   ├── src/                   # Código fuente
│   ├── config.json            # Configuración
│   └── package.json
├── parser-factura-frontend/   # Frontend Angular 21
│   ├── src/                   # Código fuente
│   └── package.json
└── README.md                  # Este archivo
```

## Requisitos

- Node.js LTS 24.13.0 o superior

### Para usar LM Studio (procesamiento local)
- LM Studio instalado y corriendo
- Modelo de visión compatible con LM Studio (recomendado: gemma-3-12b o superior)

### Para usar DeepSeek (procesamiento en la nube)
- Cuenta en DeepSeek (https://www.deepseek.com/)
- API key de DeepSeek (configurar como variable de entorno)

## Instalación Rápida

### Backend

```bash
cd parser-factura-backend
npm install
```

Edita `config.json` y configura el modelo de LM Studio.

```bash
npm run dev
```

### Frontend

```bash
cd parser-factura-frontend
npm install
npm start
```

## Configuración

### Backend

Edita `parser-factura-backend/config.json`:

**Para LM Studio:**
```json
{
  "server": {
    "port": 9401
  },
  "ai": {
    "provider": "lmstudio",
    "lmstudio": {
      "baseUrl": "http://127.0.0.1:1234",
      "model": "google/gemma-3-12b"
    }
  }
}
```

**Para DeepSeek:**
```json
{
  "server": {
    "port": 9401
  },
  "ai": {
    "provider": "deepseek",
    "deepseek": {
      "baseUrl": "https://api.deepseek.com",
      "model": "deepseek-chat"
    }
  }
}
```

**Importante para DeepSeek**: Configura la API key como variable de entorno:
- Windows (cmd): `set DEEPSEEK_API_KEY=tu-api-key`
- Windows (PowerShell): `$env:DEEPSEEK_API_KEY="tu-api-key"`
- Linux/Mac: `export DEEPSEEK_API_KEY=tu-api-key`

### Frontend

Por defecto se conecta a `http://localhost:9401`. Para cambiarlo, edita `parser-factura-frontend/src/app/services/factura.service.ts`.

## Uso

### Con LM Studio (local)

1. Iniciá LM Studio y cargá un modelo de visión
2. Configurá `config.json` con `"provider": "lmstudio"`
3. Iniciá el backend: `cd parser-factura-backend && npm run dev`
4. Iniciá el frontend: `cd parser-factura-frontend && npm start`
5. Abrí `http://localhost:9400` en el navegador
6. Subí una imagen o PDF de una factura/recibo/ticket
7. Visualizá los resultados extraídos

### Con DeepSeek (nube)

1. Obtén tu API key de DeepSeek en https://www.deepseek.com/
2. Configurá la variable de entorno `DEEPSEEK_API_KEY`
3. Configurá `config.json` con `"provider": "deepseek"`
4. Iniciá el backend: `cd parser-factura-backend && npm run dev`
5. Iniciá el frontend: `cd parser-factura-frontend && npm start`
6. Abrí `http://localhost:9400` en el navegador
7. Subí una imagen o PDF de una factura/recibo/ticket
8. Visualizá los resultados extraídos

## Endpoints del Backend

- `GET /status` - Health check
- `POST /procesar-factura` - Procesa un documento y extrae información

Ver documentación detallada en `parser-factura-backend/README.md`

## Tecnologías Utilizadas

### Backend
- Node.js 24.13.0
- TypeScript
- Express
- Winston (logging)
- Multer (upload de archivos)
- Axios (cliente HTTP)
- pdf-parse (procesamiento de PDFs)

### Frontend
- Angular 21
- TypeScript
- SCSS
- RxJS

## Arquitectura

El sistema está diseñado con una arquitectura modular y extensible:

- **Backend**: Cliente de IA abstracto (`BaseAIClient`) que permite agregar nuevos proveedores fácilmente
  - Implementaciones actuales: `LMStudioClient`, `DeepSeekClient`
- **Frontend**: Componentes standalone de Angular 21
- **Configuración**: Todo configurable externamente sin hardcodeo
- **Seguridad**: Variables de entorno para credenciales sensibles (API keys)

## Licencia

MIT

## Autor

Pablo Medina

## Contribuciones

Las contribuciones son bienvenidas. Por favor, abrí un issue o pull request.
