# syntax=docker/dockerfile:1

# ---------------------------------------------------------------------------
# RTechX — production image for self-hosting (Coolify / Docker on a VPS).
#
# Multi-stage so the shipped image contains no source, no dev dependencies and
# no build cache — roughly 150MB instead of well over a gigabyte.
# ---------------------------------------------------------------------------

FROM node:22-alpine AS base
# Next's standalone server needs libc6-compat on Alpine for sharp.
RUN apk add --no-cache libc6-compat
WORKDIR /app


# --- dependencies ----------------------------------------------------------
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci


# --- build -----------------------------------------------------------------
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# NEXT_PUBLIC_* values are inlined into the client bundle at BUILD time, not
# read at runtime. They must therefore be present here, not only in the
# container environment — set them as build variables in Coolify.
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_RAZORPAY_KEY_ID
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
ARG NEXT_PUBLIC_GA4_MEASUREMENT_ID
ARG NEXT_PUBLIC_META_PIXEL_ID
ARG NEXT_PUBLIC_WHATSAPP_GROUP_URL
ARG NEXT_PUBLIC_BOOLEAN_CHEATSHEET_URL

ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL \
    NEXT_PUBLIC_RAZORPAY_KEY_ID=$NEXT_PUBLIC_RAZORPAY_KEY_ID \
    NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL \
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=$NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY \
    NEXT_PUBLIC_GA4_MEASUREMENT_ID=$NEXT_PUBLIC_GA4_MEASUREMENT_ID \
    NEXT_PUBLIC_META_PIXEL_ID=$NEXT_PUBLIC_META_PIXEL_ID \
    NEXT_PUBLIC_WHATSAPP_GROUP_URL=$NEXT_PUBLIC_WHATSAPP_GROUP_URL \
    NEXT_PUBLIC_BOOLEAN_CHEATSHEET_URL=$NEXT_PUBLIC_BOOLEAN_CHEATSHEET_URL \
    NEXT_TELEMETRY_DISABLED=1

RUN npm run build


# --- runtime ---------------------------------------------------------------
FROM base AS runner
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

# Never run the server as root.
RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# `output: "standalone"` traces only the files actually reached at runtime.
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

# Lets Coolify/Docker restart the container if the app stops responding.
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "server.js"]
