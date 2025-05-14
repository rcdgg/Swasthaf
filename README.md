# 🧘‍♂️ SwasthAf – Health and Fitness Management Web App

SwasthAf is a full-stack health and fitness tracking application built using **Next.js**, **Supabase**, and **MySQL**. It supports user and trainer accounts, allowing personalized workouts, meal plans, progress logs, and mental wellness tracking — all on a simple and pretty interface.

---

## 🚀 Features

### 👤 For Users
- **Dashboard** with access to:
  - 🥗 **Food Window**: Log daily meals from a curated food database and track calories/macros.
  - 🏋️ **Workout Window**: Log daily exercises, calculate calories burned, and visualize muscle-group usage.
  - 📈 **Logs Window**: Track calorie balance and mental health over time.

- **Trainer Assignments**: Users can be assigned multiple trainers with individualized plans.

---

### 🧑‍🏫 For Trainers
- Assign **Workout** and **Meal Plans** to users
- View associated users and plans via the **Trainer Modal**

---

### 🔑 Authentication
- Login & Signup using Supabase Auth
- Role-based routing: Admin / Trainer / User dashboards

---

### 🧠 Admin Dashboard
- Monitor all users and trainers
- View recent mental health logs, payments, and activity status
- Sortable, interactive data tables
- Auto-calculations for average calories burned, payment tiers, etc.

---

## 🛠 Tech Stack

| Frontend     | Backend         | Database     | Auth     |
|--------------|------------------|--------------|----------|
| Next.js 14   | Supabase RPC & JS | Supabase (PostgreSQL) & MySQL | Supabase Auth |

---

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or  
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.



