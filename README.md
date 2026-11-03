# Grains Global (MERN)

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
- **Passwords:** bcrypt, 8–72 characters with a letter and a number. Five failed logins lock the account for 15 minutes.
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
- **HTTPS**: with a domain pointing at the server, put a TLS terminator in front (Caddy or certbot), then set the repo variables `CLIENT_ORIGIN=https://your-domain` and `COOKIE_SECURE=true`. Cookies are not marked Secure while the site is served over plain HTTP.
