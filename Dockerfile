FROM alpine:3.11

ENV NODE_VERSION 10.6.3
ENV TZ=Asia/Shanghai

COPY ./ /usr/app

WORKDIR /usr/app

RUN npm i

RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

CMD ["npm", "run", "start"]