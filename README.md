# Cambio de Divisas — Frontend

Aplicación web para cambiar **dólares (USD) y soles (PEN)** con el tipo de cambio de SUNAT.

Permite crear una cuenta, iniciar sesión, cerrar sesión, registrar solicitudes de cambio de divisas y consultar el historial de operaciones filtrando por rango de fechas. Las pantallas de negocio solo son accesibles con una sesión activa.

Está construida con Vue 3, TypeScript, Pinia, Vue Router y Tailwind CSS, y consume la API del repositorio `kambista-api`.

## Requisitos previos

- Node.js 20 o superior
- npm
- La API `kambista-api` en ejecución (por defecto en `http://localhost:3000`)

## Cómo levantar el proyecto en local

1. Instala las dependencias:

   ```bash
   npm install
   ```

2. Crea el archivo de variables de entorno a partir del ejemplo:

   ```bash
   cp .env.example .env
   ```

   En Windows PowerShell: `Copy-Item .env.example .env`.

3. Inicia la aplicación:

   ```bash
   npm run dev
   ```

4. Ábrela en `http://localhost:5173`. Usa `localhost` y no `127.0.0.1`: la API solo acepta peticiones del origen configurado en su variable `CORS_ORIGINS`.

## Variables de entorno

Se definen en el archivo `.env`. El archivo `.env.example` contiene el valor de ejemplo.

| Variable | Obligatoria | Valor por defecto | Descripción |
|----------|:-----------:|-------------------|-------------|
| `VITE_API_URL` | No | `http://localhost:3000/v1` | URL base de la API, incluido el prefijo `/v1` |

## Cómo ejecutar las pruebas

```bash
npm test
```

Las pruebas no necesitan la API en ejecución.
