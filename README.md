# Julian Oostwal Portfolio

A modern, full-stack portfolio website built with Next.js 16, featuring an admin panel, custom authentication, and cloud storage integration.

## ✨ Features

- 🎨 **Modern UI** - Built with HeroUI and Tailwind CSS
- 🔐 **Custom Auth** - JWT-based authentication with refresh tokens
- 📊 **Admin Panel** - Full CMS for managing projects, and settings
- 📥 **Contact Inbox** - Admin inbox for contact messages (read/unread, spam flags, reply)
- 📦 **Database** - PostgreSQL with Prisma ORM
- 🗄️ **File Storage** - SeaweedFS (S3-compatible) for image uploads
- 🔍 **SEO Optimized** - Sitemap, robots.txt, structured data, Open Graph
- 📱 **Responsive** - Mobile-first design
- ⚡ **Performance** - Turbopack, optimized images, lazy loading

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4 + HeroUI
- **Database**: PostgreSQL + Prisma
- **Auth**: JWT (jose) + bcryptjs
- **Storage**: SeaweedFS
- **Animations**: Framer Motion

## 🚀 Getting Started

### Prerequisites

- Node.js 24+
- pnpm 10+
- PostgreSQL database
- SeaweedFS S3 storage (https://github.com/seaweedfs/seaweedfs)

### Setup

1. **Clone and install dependencies**
   ```bash
   git clone https://github.com/julianoostwal/julianoostwal.dev.git
   cd julianoostwal.dev
   pnpm install
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your database and S3 credentials
   ```

3. **Setup database**
   ```bash
   pnpm db:push    # Push schema to database
   pnpm db:seed    # Seed with initial data
   ```

4. **Start development server**
   ```bash
   pnpm dev
   ```

5. **Access the app**
   - Website: http://localhost:3000
   - Admin: http://localhost:3000/admin

### Default Admin Credentials

After seeding the database:
- **Email**: info@julianoostwal.dev
- **Password**: Admin123!

⚠️ **Change these credentials immediately after first login!**

#### Private seed (optional)

If you want to seed with your own private/real data, create `prisma/seed.local.ts` (it’s gitignored).  
It should export `default async function (prismaClient) { ... }` (or a named `seed` export).

## 📜 Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server with Turbopack |
| `pnpm build` | Build for production |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |
| `pnpm db:push` | Push Prisma schema to database |
| `pnpm db:migrate` | Create and run migrations |
| `pnpm db:seed` | Seed the database |
| `pnpm db:studio` | Open Prisma Studio |

## 📁 Project Structure

```
src/
├── app/
│   ├── admin/           # Admin panel pages
│   ├── api/             # API routes
│   │   ├── auth/        # Authentication endpoints
│   │   ├── contact-messages/ # Contact inbox endpoints
│   │   ├── projects/    # Projects CRUD
│   │   ├── settings/    # Site settings
│   │   └── upload/      # File uploads
│   ├── about/           # About page
│   ├── contact/         # Contact page
│   └── projects/        # Projects page
│   ├── page.tsx         # Home page
├── components/
│   ├── admin/           # Admin components
│   └── ui/              # Shared UI components
└── lib/
    ├── auth/            # Authentication utilities
    ├── db/              # Database client
    ├── storage/         # S3 client (SeaweedFS)
    └── seo.ts           # SEO utilities
```

## 🌐 Live Website
[**julianoostwal.dev**](https://julianoostwal.dev)

## 📄 License

MIT © Julian Oostwal
