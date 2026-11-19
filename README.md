# Cambio de Divisas — Frontend

Aplicación web para cambiar **dólares (USD) y soles (PEN)** con el tipo de cambio de SUNAT. Permite crear una cuenta, iniciar sesión, registrar solicitudes de cambio y consultar el historial de operaciones por rango de fechas.

Este proyecto es el cliente de la API `kambista-api`: necesita tenerla en ejecución para funcionar.

## Tabla de contenidos

1. [Qué incluye](#qué-incluye)
2. [Stack tecnológico](#stack-tecnológico)
3. [Requisitos previos](#requisitos-previos)
4. [Puesta en marcha paso a paso](#puesta-en-marcha-paso-a-paso)
5. [Variables de entorno](#variables-de-entorno)
6. [Pantallas y comportamiento](#pantallas-y-comportamiento)
7. [Validaciones del formulario de cambio](#validaciones-del-formulario-de-cambio)
8. [Arquitectura](#arquitectura)
9. [Decisiones de diseño](#decisiones-de-diseño)
10. [Pruebas](#pruebas)
11. [Scripts disponibles](#scripts-disponibles)
12. [Solución de problemas](#solución-de-problemas)

## Qué incluye

| Funcionalidad | Detalle |
|---------------|---------|
| Registro e inicio de sesión | Validación en el cliente y mensajes de error claros. Tras registrarse, la sesión se inicia automáticamente |
| Sesión persistente | El token se conserva al recargar la página. Si expiró, se descarta y se pide iniciar sesión |
| Rutas protegidas | Las pantallas de negocio solo son accesibles con sesión activa. Quien no la tiene vuelve al login y regresa a la página que pedía |
| Cerrar sesión | Disponible desde el encabezado de cualquier pantalla protegida |
| Cambio de divisas | Formulario con monto, moneda que envías y moneda que recibes, con botón para intercambiarlas y detalle de la operación al terminar |
| Historial | Filtro por rango de fechas con estados de carga, error y vacío. Los administradores pueden consultar a otro usuario |
| Diseño responsive | Pensado para móvil, tablet y escritorio |
| Accesibilidad | Etiquetas asociadas a cada campo, errores anunciados a lectores de pantalla, navegación por teclado y foco visible |

## Stack tecnológico

| Área | Tecnología |
|------|-----------|
| Framework | Vue 3 con `<script setup>` y TypeScript |
| Empaquetado | Vite |
| Estado | Pinia |
| Enrutamiento | Vue Router |
| Estilos | Tailwind CSS 4 |
| Pruebas | Vitest, Vue Test Utils y jsdom |
| Calidad | ESLint, Prettier y `vue-tsc` |

## Requisitos previos

- **Node.js 20 o superior** y **npm**.
- La API **`kambista-api` en ejecución**. Sigue el README de ese repositorio. Por defecto escucha en `http://localhost:3000`.

## Puesta en marcha paso a paso

1. **Instala las dependencias**

   ```bash
   npm install
   ```

2. **Crea tu archivo de variables de entorno**

   ```bash
   cp .env.example .env
   ```

   En Windows PowerShell usa `Copy-Item .env.example .env`. El valor por defecto apunta a la API en el puerto 3000, así que normalmente no necesitas cambiar nada.

3. **Inicia la aplicación en modo desarrollo**

   ```bash
   npm run dev
   ```

4. **Ábrela en el navegador** en `http://localhost:5173`.

   Usa exactamente `localhost` y no `127.0.0.1`: la API solo acepta peticiones del origen configurado en su variable `CORS_ORIGINS` (por defecto `http://localhost:5173`).

5. **Crea una cuenta** desde "Regístrate" y empieza a operar.

Para generar la versión de producción:

```bash
npm run build
npm run preview
```

El resultado queda en `dist/`.

## Variables de entorno

| Variable | Obligatoria | Valor por defecto | Descripción |
|----------|:-----------:|-------------------|-------------|
| `VITE_API_URL` | No | `http://localhost:3000/v1` | URL base de la API, incluido el prefijo `/v1` |

Las variables de Vite se incorporan al compilar, por lo que cambiarlas requiere reiniciar `npm run dev` o volver a ejecutar `npm run build`.

## Pantallas y comportamiento

| Ruta | Acceso | Descripción |
|------|--------|-------------|
| `/login` | Solo sin sesión | Inicio de sesión. Respeta el parámetro `redirect` para volver a la página solicitada |
| `/register` | Solo sin sesión | Registro de usuario |
| `/exchange` | Con sesión | Formulario de cambio y detalle de la operación |
| `/history` | Con sesión | Historial con filtro por fechas |

Cualquier otra ruta redirige a `/exchange`.

### Estados de la interfaz

- **Cargando:** los botones muestran un indicador y se desactivan mientras se envía una solicitud. El historial muestra filas de relleno mientras llega la respuesta.
- **Error:** el mensaje devuelto por la API se muestra tal cual en una alerta. Si no hay conexión con el servidor se explica con un mensaje propio. En el historial se ofrece reintentar.
- **Vacío:** si el rango no tiene operaciones se muestra un mensaje que sugiere cambiar las fechas.
- **Sesión vencida:** si la API responde `401` a una petición autenticada, la sesión se cierra y se redirige al login.

### Historial de otros usuarios

Si el usuario tiene rol `admin`, aparece el campo "ID de usuario" en el filtro. Con el campo vacío se consulta el propio historial. Para los usuarios con rol `user` el campo no se muestra.

## Validaciones del formulario de cambio

| Campo | Regla | Mensaje |
|-------|-------|---------|
| Monto | No vacío | Ingresa el monto a cambiar |
| Monto | Solo dígitos y un separador decimal (`.` o `,`) | El monto debe ser un número, sin letras ni signos |
| Monto | Máximo 2 decimales | El monto admite como máximo 2 decimales |
| Monto | Máximo 7 dígitos enteros (hasta 9,999,999.99) | El monto no puede superar 7 dígitos enteros |
| Monto | Mayor a cero | El monto debe ser mayor a cero |
| Monedas | Origen y destino distintas | La moneda de origen y la de destino no pueden ser iguales |

Los errores aparecen al salir de un campo o al intentar enviar el formulario. Si alguna regla falla, no se hace ninguna petición a la API. La API vuelve a validar todo, por lo que cualquier error que ella detecte también se muestra al usuario.

## Arquitectura

El código se organiza por **funcionalidades** (features) y no por tipo de archivo, para que todo lo que pertenece a una pantalla viva junto.

```
src/
├── main.ts                 Punto de entrada: crea la app, Pinia y el router
├── App.vue
├── app/
│   └── router/             Rutas, guardas de navegación y metadatos de ruta
├── core/                   Infraestructura sin lógica de negocio
│   ├── config.ts           URL de la API
│   ├── auth/               Tipos de sesión y lectura de la expiración del JWT
│   ├── http/               Cliente HTTP y manejo de errores de la API
│   └── storage/            Persistencia de la sesión en localStorage
├── shared/                 Piezas reutilizables por varias funcionalidades
│   ├── composables/        useForm: validación y envío de formularios
│   ├── validation/         Reglas de validación componibles
│   ├── ui/                 Botón, campos, alertas, estado vacío, logo
│   ├── utils/              Formateo de dinero, tasas y fechas
│   └── domain/             Tipos de moneda y de transacción
├── layouts/                Plantillas: AuthLayout (login) y AppLayout (con encabezado)
├── features/
│   ├── auth/               Sesión (store Pinia), login y registro
│   ├── exchange/           Formulario de cambio y detalle de la operación
│   └── history/            Filtro de fechas y tabla de operaciones
└── test-support/           Utilidades compartidas por las pruebas
```

Dentro de cada funcionalidad:

```
features/exchange/
├── api/           Llamadas a la API (una función por endpoint)
├── composables/   Estado y lógica de la pantalla (useExchangeForm)
├── components/    Piezas visuales propias de la funcionalidad
├── views/         Pantalla que une composable y componentes
└── validation.ts  Reglas de validación específicas
```

### Responsabilidades

| Capa | Qué hace | Qué no hace |
|------|----------|-------------|
| `views` y `components` | Muestran datos y capturan eventos | No contienen lógica de negocio ni llaman a `fetch` |
| `composables` | Orquestan validación, envío y estado de la pantalla | No conocen el DOM |
| `api` | Traducen una acción a una petición HTTP tipada | No guardan estado |
| `core/http` | Añaden el token, convierten errores y avisan de sesiones vencidas | No saben qué endpoints existen |
| `stores` (Pinia) | Guardan el estado compartido entre pantallas: la sesión | No guardan estado propio de una sola pantalla |

### Flujo de un formulario

Los tres formularios con envío (login, registro y cambio) y el filtro del historial usan el mismo composable, `useForm`:

1. Reciben valores iniciales, reglas por campo y la acción a ejecutar.
2. Calculan los errores en vivo, pero solo los muestran cuando el campo perdió el foco o se intentó enviar.
3. Al enviar, validan; si todo es correcto ejecutan la acción y exponen `isSubmitting`, `submitError` y el resultado.

Así la validación, el estado de carga y el manejo de errores están escritos una sola vez.

## Decisiones de diseño

| Decisión | Motivo |
|----------|--------|
| **Vue 3 + Vite en lugar de Nuxt** | Todas las pantallas de negocio exigen sesión, así que el renderizado en servidor no aporta nada y solo añadiría complejidad |
| **Organización por funcionalidades** | Reduce el salto entre carpetas al trabajar en una pantalla y deja claro qué se puede reutilizar (`shared`) y qué no |
| **Reglas de validación como funciones** | Cada regla es una función pequeña que devuelve un mensaje o `null`. Se combinan con `all(...)`, se prueban sin montar componentes y no hace falta una librería de formularios |
| **Un único composable de formularios** | Evita repetir la lógica de errores, carga y envío en cada pantalla |
| **Pinia solo para la sesión** | Es el único estado que comparten varias pantallas. El resto vive en composables locales |
| **Cliente HTTP propio sobre `fetch`** | Son menos de 100 líneas: añade el token, normaliza los errores y centraliza el manejo del `401` sin añadir dependencias |
| **El cliente HTTP avisa y no decide** | Ante un `401` solo notifica. Quien cierra la sesión y redirige es `main.ts`, así el módulo de red no depende del router ni de los stores |
| **Sesión en `localStorage`** | Permite sobrevivir a una recarga. El token expirado se descarta al arrancar. Es una decisión consciente: el almacenamiento accesible desde JavaScript es vulnerable a XSS, por eso la interfaz no inyecta HTML y el token tiene una vigencia limitada (1 hora por defecto) |
| **El monto es texto en el formulario** | Permite validar exactamente lo que el usuario escribió (decimales, ceros a la izquierda, coma decimal) antes de convertirlo a número |
| **Formato con `Intl` y zona horaria de Lima** | Las fechas del historial coinciden con las de la API, que interpreta los rangos en hora de Lima |
| **Tailwind con tokens de marca** | Los colores principales se definen una vez en `styles/main.css` y todos los componentes los usan |

## Pruebas

```bash
npm test
```

Ejecuta las pruebas con Vitest. No necesitan la API: se sustituyen las llamadas de red.

| Qué se prueba | Ejemplos |
|---------------|----------|
| Reglas de validación | Montos válidos e inválidos con su mensaje, formato de correo, combinación de reglas |
| `useForm` | Errores ocultos hasta tocar el campo, bloqueo del envío inválido, estados de carga y error |
| Cliente HTTP | Envío del token, endpoints públicos sin token, conversión de errores, aviso de sesión vencida |
| Sesión | Login, registro, cierre de sesión, restauración y descarte de tokens expirados |
| Guardas de navegación | Redirección al login conservando la ruta, acceso con sesión, bloqueo del login a usuarios autenticados |
| Pantalla de cambio | Validaciones, intercambio de monedas, envío correcto, error de la API |
| Pantalla de historial | Carga inicial, estado de carga, vacío, error con reintento, validación de fechas, vista de administrador |

Para volver a ejecutar las pruebas al guardar cambios: `npm run test:watch`.

## Scripts disponibles

| Script | Qué hace |
|--------|----------|
| `npm run dev` | Servidor de desarrollo con recarga en caliente |
| `npm run build` | Revisa los tipos y genera la versión de producción en `dist/` |
| `npm run preview` | Sirve localmente la versión de producción |
| `npm test` | Ejecuta las pruebas una vez |
| `npm run test:watch` | Ejecuta las pruebas al guardar |
| `npm run typecheck` | Revisa los tipos de TypeScript y de los componentes Vue |
| `npm run lint` | Revisa el código con ESLint |
| `npm run format` | Da formato al código con Prettier |

## Solución de problemas

| Síntoma | Causa probable | Qué hacer |
|---------|----------------|-----------|
| "No se pudo conectar con el servidor" | La API no está en ejecución o la URL es incorrecta | Inicia la API y revisa `VITE_API_URL` |
| El navegador bloquea las peticiones (error de CORS) | Abriste la app en un origen que la API no permite | Usa `http://localhost:5173` o añade tu origen a `CORS_ORIGINS` en la API |
| Al cambiar divisas aparece "Aún no hay un tipo de cambio registrado" | La API todavía no guardó su primera lectura de SUNAT | Espera unos segundos e inténtalo de nuevo |
| Quedas fuera de la sesión de repente | El token expiró | Vuelve a iniciar sesión |
