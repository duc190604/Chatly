FROM node:22.13.0 AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

ARG NEXT_PUBLIC_API_URL
ARG SERVER_API_URL
ARG NEXTAUTH_URL
ARG NEXTAUTH_SECRET

ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV SERVER_API_URL=$SERVER_API_URL
ENV NEXTAUTH_URL=$NEXTAUTH_URL
ENV NEXTAUTH_SECRET=$NEXTAUTH_SECRET

COPY . .

RUN npm run build

FROM node:22.13.0 AS runtime

WORKDIR /app

COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public

ENV PORT=${PORT}
ENV NEXTAUTH_URL=${NEXTAUTH_URL}
ENV NEXTAUTH_SECRET=${NEXTAUTH_SECRET}

EXPOSE ${PORT}

CMD ["node", "server.js"]
