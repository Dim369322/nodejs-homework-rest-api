FROM node:14.15.5-alpine

WORKDIR /server

COPY ./package.json .
RUN npm install

COPY . .

EXPOSE 3000

CMD npm start