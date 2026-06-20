FROM node:20-alpine

WORKDIR /app

COPY server/package*.json ./
RUN npm install --omit=dev

COPY server/src ./src
COPY data ./data

EXPOSE 3001

CMD ["npm", "start"]
