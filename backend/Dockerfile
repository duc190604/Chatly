#Build
FROM node:22.13.0 AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN  npm run build
#Runtime
FROM node:22.13.0
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/package-lock.json ./package-lock.json
RUN npm install --production
CMD ["node", "dist/main"]

#docker build -t chat_app_be .
#docker run -d -p 8017:8017 --env-file .env chat_app_be



