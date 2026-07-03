# Rose backend

Node.js + Express + Socket.io + PostgreSQL (via Prisma). Relays and stores
only ciphertext — it never sees a plaintext message or a private key.

## Deploy to Render (free tier works for testing)

1. Push this `backend/` folder to a GitHub repo.
2. On Render.com: **New > PostgreSQL** — create a free Postgres instance, copy its "Internal Database URL".
3. **New > Web Service** — connect your repo, root directory `backend`.
   - Build command: `npm install && npx prisma generate`
   - Start command: `npm run start`
4. Add environment variables on the service:
   - `DATABASE_URL` = the Postgres URL from step 2
   - `JWT_SECRET` = any long random string (e.g. `openssl rand -hex 32`)
5. Deploy. Then run the migration once, either via Render's Shell tab or locally
   pointed at the same `DATABASE_URL`:
   ```
   npx prisma migrate deploy
   ```
6. Confirm it's alive: `https://your-service.onrender.com/health` should return `{"ok":true}`.

## Local development
```
npm install
cp .env.example .env   # fill in DATABASE_URL and JWT_SECRET
npx prisma migrate dev --name init
npm run dev
```

## Notes / next steps for production hardening
- Swap the in-memory `online` map in `src/socket.js` for Redis if you run more than one server instance.
- Add rate limiting (e.g. `express-rate-limit`) on `/auth/*`.
- Add phone-number verification via Twilio if you want WhatsApp-style onboarding.
- Add push notifications (Expo Notifications) so messages arrive when the app is backgrounded.
