FROM node:20-bookworm-slim
RUN apt-get update && apt-get install -y --no-install-recommends ffmpeg python3 python3-pip fonts-dejavu-core fonts-freefont-ttf ca-certificates && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev
COPY src ./src
COPY python_worker ./python_worker
RUN mkdir -p /var/data/uploads /var/data/exports /var/data/data
ENV NODE_ENV=production PORT=10000 STORAGE_PROVIDER=cloudinary
EXPOSE 10000
CMD ["node", "src/server.js"]
