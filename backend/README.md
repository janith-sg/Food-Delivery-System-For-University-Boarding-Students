# UNI EATS API

## Admin login (fixed user)

1. Set in `.env` (see `.env.example`):
   - `JWT_SECRET` — required for login tokens
   - `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME`, `ADMIN_PHONE` — the admin account is **synced on every server start** to match these values (password is re-hashed). Use a **dedicated** admin email if possible.

2. Start / restart the server: `npm start` — after changing `.env`, always restart.

3. Log in on the **Login** page with exactly `ADMIN_EMAIL` / `ADMIN_PASSWORD` (no extra spaces; avoid wrapping the password in quotes unless intentional).

4. **Student/staff** accounts registered via **Register** cannot use this login — they get *"Administrator login only"*. Only `accountType: "admin"` works here.

5. Change the default password: update `ADMIN_PASSWORD` in `.env`, delete the admin user from MongoDB, restart (or change the password directly in the DB).

## Other routes

- `POST /api/register` — student/staff registration  
- `POST /api/login` — **admin only**
