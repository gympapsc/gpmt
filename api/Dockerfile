FROM node:slim as builder

COPY . .
RUN npm install
RUN npm install -g typescript
WORKDIR /
RUN sh -c tsc --project tsconfig.json

FROM node:slim
COPY --from=builder /build/src /app/src
COPY --from=builder /node_modules /app/node_modules
COPY --from=builder /package.json /app
COPY --from=builder /ormconfig.js /app/ormconfig.js
COPY --from=builder /rasaconfig.json /app/rasaconfig.json
RUN ls /app/src
WORKDIR /app
EXPOSE 80

CMD ["node", "src/index.js"]
