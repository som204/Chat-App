FROM node:22.17.1-slim

WORKDIR /app

COPY package*.json ./

RUN npm install --only=production

COPY . .

EXPOSE 3000

CMD ["node", "server.js"]
