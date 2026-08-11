# IMR Movies Rental Database Portal - CPRG306 - Assignment 3

A web portal built for the Internet Movies Rental Company (IMR) to manage their movie database. Built with Next.js and Supabase as part of the Full-Stack Web Applications assignment.

## About

IMR needed a simple internal tool for staff to view and maintain their movie catalog. This portal lets logged-in staff view the full movie list, add new titles, and gives Admins additional ability to edit or delete existing entries.

## Features

- **Movie catalog** — displays each movie's title, release year, and cast
- **Add movies** — any logged-in user can add a new movie to the catalog
- **Edit & delete movies** — restricted to Admin accounts only
- **Role-based authentication** — two account types (User and Admin) with different permission levels, enforced both in the UI and at the database level via Supabase Row Level Security
- **Responsive design** — works across desktop and mobile screen sizes

## Tech stack

- **Next.js** (App Router) — React framework handling routing and page structure
- **Tailwind CSS** — styling
- **Supabase** — hosted Postgres database, authentication, and Row Level Security for permissions
