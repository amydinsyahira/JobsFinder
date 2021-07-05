FROM node:14.15.4-alpine
LABEL author="Amydin S"

RUN set -x \
    && apk update \
    && apk upgrade \
    && apk add --no-cache \
    udev \
    curl \
    ttf-freefont \
    zip \
    unzip
RUN mkdir -p /home/node/app \
    && chown -R node:node /home/node/app  

WORKDIR /home/node/app
COPY --chown=node:node . .

RUN npm install --production

CMD [ "node", "./index.js" ]