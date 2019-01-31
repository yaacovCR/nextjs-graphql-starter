# base image
FROM node:10.13.0-alpine

# set working directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# specify app dependencies
COPY package*.json ./

# install and cache dependencies
ARG registry=https://registry.npmjs.org
RUN npm install --registry=$registry

# install app
COPY . ./

# start app
CMD ["npm", "run", "dev"]