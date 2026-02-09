# tock-backend

Este es el punto de entrada principal para la aplicación Tock Music. Contiene la API y la configuración `docker-compose` para orquestar el full stack (Frontend, Backend y Base de Datos).

## 📂 Estructura del Proyecto (Necesaria para Docker)

Para que la configuración de Docker funcione, ambos repositorios deben ser carpetas hermanas en tu espacio de trabajo:

```text
workspace/
├── tock-backend/   <-- Contiene docker-compose.yml
└── tock-frontend/  <-- El repositorio del frontend
```

## 🚀 Configuración Full Stack (Docker)

### 1. Configuración

Crea un archivo `.env` en la raíz del `tock-backend`. Usa este template:

```plaintext
# Configuración de la Base de Datos
DB_ROOT_PASSWORD=change_this_password
DB_NAME=tock_music_db
DB_USER=tock_user
DB_PASSWORD=change_this_user_password

# Seguridad JWT
JWT_SECRET=change_this_to_a_secure_random_string

# Conexión a Prisma (Red Interna Docker)
DATABASE_URL="mysql://root:change_this_password@tock_mysql_server:3306/tock_music_db"
```

### 2. Ejecución del Proyecto

Navega al directorio `tock-backend` y ejecuta:

```bash
docker compose up --build
```

Esto construirá las imágenes de frontend y backend y iniciará la base de datos MySQL.

### 3. Inicialización de la Base de Datos

Una vez que los contenedores estén en ejecución, abre un nuevo terminal en esta carpeta y ejecuta las migraciones de Prisma:

```bash
docker exec -it tock_bun_backend bunx prisma db push
```

La aplicación ahora está ejecutándose en `http://localhost:4200`.

## 🛠 Desarrollo Local Manual (Sin Docker)

### Instalación de Dependencias

```bash
bun install
```

### Ejecución

```bash
bun run index.ts
```

### Este proyecto fue creado usando `bun init` en bun v1.3.8. Bun es un entorno de ejecución JavaScript rápido y todo-en-uno.
