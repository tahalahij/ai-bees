FROM node:16.13.2

WORKDIR '/ai-bees'

COPY package.json .
COPY tsconfig.json .
COPY tsconfig.build.json .
COPY nest-cli.json .
COPY src ./src
COPY .env .

RUN npm install
RUN npm run build

EXPOSE 3033

CMD ["npm", "run", "start:prod" ]
