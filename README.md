# Agri Global (MERN)

- `server/` Express + Mongoose API: products, offers, leads, stats, partner earnings, JWT auth, KYC, seller offers, admin review
- `client/` React + Vite, three.js (react-three-fiber), framer-motion, Lenis

```
npm run install:all
npm run seed     # replaces products, offers and stats in the database
npm run dev      # API :5050, site :5173
```
Set `MONGODB_URI`, `JWT_SECRET`, `ADMIN_EMAIL` in `server/.env` (see `.env.example`).
Registering with `ADMIN_EMAIL` creates the admin, who approves KYC and offers.

## Admin console (`/admin`)
Glass dashboard for admins: overview analytics, users & KYC, offers, varieties, leads (CSV export), homepage stats.
To become admin, register with the email in `ADMIN_EMAIL`, then open `/admin`.

## Security
- **Sessions:** a 15-minute access token (kept in memory) plus a 7-day refresh token in an HttpOnly, SameSite=Strict cookie. Refresh tokens rotate on every use, are stored hashed, and replaying an old one signs the user out everywhere.
- **Passwords:** bcrypt, 8–72 characters with a letter and a number. Five failed logins lock that account for 15 minutes; an IP address is paused after 20 *failed* attempts (successful sign-ins never count, so offices sharing one IP are fine).
- **Authorization:** role checks on every protected route (admin, seller). Changing a password or an admin reset signs the user out of all devices.
- **Hardening:** security headers (CSP, nosniff, frame-deny), rate limits, NoSQL-injection filtering, same-origin check on cookie endpoints, request-size limits.
- **Production:** set `NODE_ENV=production` (Secure cookies, HSTS), `CLIENT_ORIGIN` to your site's URL, `TRUST_PROXY=1` behind nginx, and serve over HTTPS.

## Deployment (GitHub Actions → Docker Hub → AWS EC2)
Push to `main` and the pipeline does everything:
1. **Test** – syntax-checks and tests the server, builds the client.
2. **Build & push** – builds `grains-server` and `grains-web` (React + nginx) and pushes both to Docker Hub, tagged with the commit and `latest`.
3. **Deploy** – copies the compose file to the server, writes the app's secrets, pulls the new images and restarts the stack.
4. **Verify** – waits for the server and API to report healthy; if they don't, it **rolls back to the previous version** and fails the run. Then it smoke-tests the public URL.

Pull requests and other branches run the CI workflow only (tests + a Docker build, nothing is pushed or deployed).

### One-time setup
- **Server** (done): Docker, Docker Compose, swap and `/opt/grains` on the EC2 instance. Open inbound port 80 (and 22) in the security group.
- **GitHub**: run `DOCKERHUB_TOKEN='…' bash deploy/bootstrap-github.sh` once. It creates the private repo, stores the secrets (`DOCKERHUB_USERNAME`, `DOCKERHUB_TOKEN`, `EC2_HOST`, `EC2_USER`, `EC2_SSH_KEY`, `EC2_KNOWN_HOSTS`, `MONGODB_URI`, `JWT_SECRET`, `ADMIN_EMAIL`) and variables (`CLIENT_ORIGIN`, `COOKIE_SECURE`), and pushes. Add `--dry-run` to preview.
- **MongoDB Atlas**: Network Access must allow the server's IP.

### Everyday
- Logs: `ssh ec2-user@<host> 'cd /opt/grains && docker compose logs -f'`
- Redeploy a specific commit: Actions → Deploy → Run workflow (or `bash deploy.sh <tag>` on the server).
- **HTTPS**: Caddy (in `deploy/docker-compose.yml`, configured by `deploy/Caddyfile`) serves `agriglobal.co.in` (site) and `api.agriglobal.co.in` (API) over HTTPS with automatic Let's Encrypt certificates. Requirements: DNS A records for `agriglobal.co.in`, `www` and `api` pointing at the server, inbound ports 80 and 443 open in the security group, and repo variables `CLIENT_ORIGIN=https://agriglobal.co.in` and `COOKIE_SECURE=true`.


## Tests
- `cd server && npm test` – unit tests for the password policy, injection filtering, token handling, role checks and rate limiting (no database needed).
- CI runs these plus a client build and Docker image builds on every push and pull request.
- Browser-level checks used while building this (all pages, search, menus, calculators, forms, sign-in/up, the admin console, accessibility and overflow at 6 screen widths) drove real Chrome with `puppeteer-core`. They create test data, so run them against a throw-away database, not production.

Email	contact@adihuman.com
Password	8JJUOQKSxdS8ftK2Aa9
Role	admin