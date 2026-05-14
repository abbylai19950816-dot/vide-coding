# Product Scope

## Purpose

Gyrobooking is a low-cost Pilates booking system for:

- students to buy classes, check remaining sessions, and book available slots;
- admins to manage students, tickets, payments, schedules, attendance, and public booking data.

## User Roles

- Student: uses `index.html`; should only access public booking data and their own lookup result.
- Admin: uses `admin.html`; manages private operational data.
- Maintainer: updates files, packages releases, deploys to GitHub Pages/Firebase, and records work logs.

## Current Operating Principles

- Keep the student page cheap and simple.
- Keep private data off the public student read path.
- Keep booking correctness inside Firestore transaction boundaries.
- Use docs as SSOT when code behavior changes.
- 日期與時間判斷以使用者裝置當地時間為準；不要在前端硬加固定 UTC+8。
