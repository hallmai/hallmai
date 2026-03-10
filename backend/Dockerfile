FROM node:22-alpine AS builder
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile
COPY . .
RUN yarn build

FROM node:22-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json /app/yarn.lock ./
RUN yarn install --production --frozen-lockfile
EXPOSE 4000
CMD ["node", "dist/main.js"]
