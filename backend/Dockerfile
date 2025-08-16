# ---- Build stage ----
FROM node:20-alpine AS build
WORKDIR /app

# Install deps (si tu as package-lock.json)
COPY package*.json ./
RUN npm ci

# Copy sources + build
COPY . .
# Nest build (sortie: dist/)
RUN npm run build

# ---- Run stage ----
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production \
    PORT=3000
# Copie uniquement ce qui est nécessaire au run
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist

# Si tu utilises .env à la racine backend, on le montera via docker-compose (pas copié ici)
EXPOSE 3000
HEALTHCHECK --interval=10s --timeout=3s --retries=5 \
  CMD node -e "fetch('http://localhost:3000/health').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))" || exit 1

CMD ["node", "dist/main.js"]
