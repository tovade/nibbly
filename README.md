<a id="readme-top"></a>

<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/tovade/nibbly">
    <img src="./.github/banner.png" alt="Logo" width="320" height="auto">
  </a>

  <h3 align="center">Nibbly</h3>

  <p align="center">
    One small bite, one big link!
  </p>
</div>

<!-- ABOUT THE PROJECT -->

## About The Project

This is a shorturl service. I've made this for fun so the code isn't really that good probably. I did my best and I actually enjoyed making this project :D. Please don't judge too hard, this is just a hobby project. I don't have plans to host this online just yet, I don't have a host and I don't want to put data at risk :). The backend is written myself, the frontend was partially coded with the assistance of AI. Mostly cause I'm still new to tailwind and the goal of this project wasn't really frontend at all.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Built With

- **[Bun](https://bun.sh/)** - Runtime and package manager
- **[Elysia](https://elysiajs.com/)** - Fast and friendly Bun web framework
- **[Better Auth](https://www.better-auth.com/)** - Authentication library
- **[Drizzle ORM](https://orm.drizzle.team/)** - Lightweight and performant ORM
- **[PostgreSQL](https://www.postgresql.org/)** - Relational database
- **[Redis](https://redis.io/)** - In-memory store, used as the queue backend for scheduled jobs
- **[BullMQ](https://bullmq.io/)** - Job queue and scheduler (cleanup of old anonymous links)
- **[Docker Compose](https://docs.docker.com/compose/)** - Optional one-command setup for PostgreSQL and Redis
- **[React](https://react.dev/)** - UI library for frontend
- **[Vite](https://vitejs.dev/)** - Next generation frontend build tool
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[TypeScript](https://www.typescriptlang.org/)** - Strongly typed programming language
- **[Tanstack Start](https://tanstack.com/start/latest)** - Fullstack framework used for the frontend
- **[Shadcn](https://ui.shadcn.com/docs)** - A set of beautifully-designed, accessible components

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- GETTING STARTED -->

## Getting Started

To get a local copy up and running follow these steps.

### Prerequisites

This project uses **Bun** as the runtime and package manager. Make sure you have the following installed:

- **Bun** (v1.0 or higher)

  ```sh
  bun --version
  ```

  Install guide: https://bun.com/

- **Git**

  ```sh
  git --version
  ```

  Windows: https://git-scm.com/install/windows
  Linux: use your package manager to install git that comes with your distro.

- **PostgreSQL** (v12 or higher) **and Redis** (v6.2 or higher)

  The easiest way is **Docker** with the included `docker-compose.yml`, which starts both for you:

  ```sh
  docker --version
  docker compose version
  ```

  Install guide: https://docs.docker.com/get-started/get-docker/

  Prefer not to use Docker? Install [PostgreSQL](https://www.postgresql.org/download/) and [Redis](https://redis.io/docs/latest/operate/oss_and_stack/install/) yourself and point the `.env` values at them.

### Installation

1. Clone the repo

   ```sh
   git clone https://github.com/tovade/nibbly.git
   cd nibbly
   ```

2. Start PostgreSQL and Redis (skip this if you run your own)

   ```sh
   docker compose up -d
   ```

   This starts Postgres on port `5432` and Redis on port `6379`, with data kept in Docker volumes. The defaults are user `postgres`, password `postgres` and database `nibbly`. To change them (or the ports), set `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`, `POSTGRES_PORT` or `REDIS_PORT` in a `.env` file next to `docker-compose.yml`.

3. Go to the backend folder

   ```sh
   cd backend
   ```

4. Install packages with bun !!!IMPORTANT!!! this project runs on the bun runtime

   ```sh
   bun install
   ```

5. Set up environment variables

   ```sh
   # Copy the example environment file
   cp .env.example .env
   ```

   Open the `.env` file and fill in the required values:

   ```env
   # port the server runs on
   PORT=3001

   # Database
   # With the docker compose defaults this is:
   # postgresql://postgres:postgres@localhost:5432/nibbly
   DATABASE_URL=postgresql://[user]:[password]@[host][:port][/dbname]

   # just smash your keyboard here like 5 times to generate a super secret secret
   BETTER_AUTH_SECRET=MY_SUPER_DUPER_SECRET_URL
   BETTER_AUTH_URL=http://localhost:3000 # Base URL of your app (the frontend)

   # REQUIRED: secret used to hash visitor IPs for unique-click counting.
   # The server refuses to start without it. Generate one with: openssl rand -hex 32
   ANALYTICS_SALT=CHANGE_ME_TO_A_LONG_RANDOM_STRING

   # Only set to true when running behind a reverse proxy/CDN you control,
   # so x-forwarded-for / cf-connecting-ip are trusted for the client IP.
   TRUST_PROXY=false

   # Redis, used by BullMQ for scheduled jobs
   # format: redis://[user:password@]host[:port][/db]
   REDIS_URL=redis://localhost:6379
   # Set to false to not start the job scheduler/worker in this process
   JOBS_ENABLED=true
   # Prefix for all redis keys, change it if several apps share one redis
   JOBS_PREFIX=nibbly
   ```

6. Set up the database

   Make sure PostgreSQL is running (see step 2).

   ```sh
   # Apply migrations to your database
   bun run db:migrate

   # Alternatively, push schema directly (for development)
   bun run db:push
   ```

   **Optional:** Open Drizzle Studio to view and manage your database:

   ```sh
   bun run db:studio
   ```

7. Start the backend development server

   ```sh
   bun run dev
   ```

   The backend should now be running on `http://localhost:3001` (or the port you specified). On startup it also connects to Redis and registers the scheduled jobs. If Redis isn't available, either start it or set `JOBS_ENABLED=false`.

8. Set up the frontend

   Open a new terminal and navigate to the frontend folder:

   ```sh
   cd frontend
   ```

   (from the repository root)

9. Install frontend dependencies

   ```sh
   bun install
   ```

10. Set up frontend environment variables

    ```sh
    # Copy the example environment file
    cp .env.example .env
    ```

    Open the `.env` file and fill in the required values:

    ```env
    # Your backend URL (should match the backend PORT)
    VITE_BACKEND_URL="http://localhost:3001"
    ```

11. Start the frontend development server

    ```sh
    bun run dev
    ```

    The frontend should now be running on `http://localhost:3000`. Open it, create an account and make your first short link!

### Scheduled jobs

Jobs live in `backend/src/lib/jobs/definitions/` and run through BullMQ, so they need Redis. Currently there is one:

| Job                      | Schedule       | What it does                                                          |
| ------------------------ | -------------- | --------------------------------------------------------------------- |
| `cleanup-orphaned-links` | Daily at 03:00 | Deletes links with no owner older than 30 days (and their click data) |

Links that belong to an account are never removed by this job. To run the API without the scheduler (for example when jobs run in a separate process), set `JOBS_ENABLED=false`.

### Useful commands

Backend (`backend/`):

| Command               | Description                                    |
| --------------------- | ---------------------------------------------- |
| `bun run dev`         | Start the server with hot reload               |
| `bun run start`       | Start the server                               |
| `bun run build`       | Bundle the server into `dist/`                 |
| `bun test`            | Run the tests                                  |
| `bun run db:generate` | Generate a migration after changing the schema |
| `bun run db:migrate`  | Apply migrations                               |
| `bun run db:push`     | Push the schema directly (development)         |
| `bun run db:studio`   | Open Drizzle Studio                            |
| `bun run format`      | Format with Prettier                           |

Frontend (`frontend/`):

| Command         | Description                         |
| --------------- | ----------------------------------- |
| `bun run dev`   | Start the dev server on port 3000   |
| `bun run build` | Production build                    |
| `bun run test`  | Run the tests                       |
| `bun run check` | Format with Prettier and fix ESLint |

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- CONTRIBUTING -->

## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".
Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

<!-- LICENSE -->

## License

Distributed under the Apache 2.0 License. See `LICENSE.md` for more information.

<p align="right">(<a href="#readme-top">back to top</a>)</p>
