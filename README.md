# Cambio de Divisas, Frontend

Aplicación web para cambiar dólares (USD) y soles (PEN) con el tipo de cambio de SUNAT.

Permite crear una cuenta, iniciar y cerrar sesión, registrar solicitudes de cambio y consultar el historial de operaciones filtrando por rango de fechas. Las pantallas de negocio solo son accesibles con una sesión activa. Está hecha con Vue 3, TypeScript, Pinia, Vue Router y Tailwind CSS, y consume la API del repositorio `kambista-api`.

## Requisitos previos

- Node.js 20.19 o superior
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

4. Ábrela en `http://localhost:5173`. Usa `localhost` y no `127.0.0.1`, porque la API solo acepta peticiones del origen configurado en su variable `CORS_ORIGINS`.

## Variables de entorno

Se definen en `.env`. El archivo `.env.example` contiene el valor de ejemplo.

| Variable | Obligatoria | Valor por defecto | Descripción |
|----------|:-----------:|-------------------|-------------|
| `VITE_API_URL` | No | `http://localhost:3000/v1` | URL base de la API, incluido el prefijo `/v1` |

## Cómo ejecutar las pruebas

```bash
npm test
```

No necesitan la API en ejecución.

## Decisiones de diseño

**Organización por funcionalidad.** El código está en `features/auth`, `features/exchange` y `features/history`, cada una con su API, sus composables, sus vistas y sus reglas de validación. Lo que comparten va en `shared` (componentes de interfaz, formateadores, validación) y lo transversal en `core` (cliente HTTP y almacenamiento de sesión). Así una funcionalidad se entiende leyendo una sola carpeta.

**Pinia solo para la sesión.** Es el único estado que necesitan varias pantallas a la vez. El resto del estado (formularios, resultados) es local y vive en composables, para no meter en un store global cosas que solo usa una vista.

**Validación en funciones puras.** Las reglas (`required`, `minLength`, el monto con máximo 2 decimales y 7 enteros, monedas distintas) son funciones pequeñas que se combinan, y un composable `useForm` las aplica. Son fáciles de probar sin montar ningún componente. Los errores se muestran al salir del campo o al enviar, no mientras el usuario escribe.

**Renovación de sesión en el cliente HTTP.** El access token dura poco, así que ante un 401 el cliente intenta renovar la sesión con el refresh token y repite la petición una sola vez. Si varias peticiones fallan a la vez comparten una única renovación, porque el refresh token solo sirve una vez. Si la renovación falla, se cierra la sesión y se vuelve al login recordando la página que se pedía.

**Token en `localStorage`.** Lo elegí para que la sesión sobreviva a recargar la página, porque la API y la web son orígenes distintos y con cookies `httpOnly` tendría que ajustar CORS y proteger contra CSRF. El riesgo es que un XSS pueda leerlo, y lo reduzco con un access token de 15 minutos y sin renderizar HTML que venga de la API.

**Paginación desde cabeceras.** El historial se pide de a 10 operaciones. El total y las páginas se leen de las cabeceras que expone la API, y al cambiar los filtros se vuelve a la primera página.

**Estados de la interfaz.** Cada pantalla que depende de la red cubre carga (botones deshabilitados y filas de relleno en el historial), error con opción de reintentar, y vacío con un mensaje que explica qué hacer.
