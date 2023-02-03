#!/bin/bash

name=$1

if [ -z "$name" ]; then
    echo 'Set the process name please: "./docker-run.sh [name]"'
    exit
fi

if docker ps --format '{{.Names}}' | grep "$name"; then
  docker stop "$name" && docker rm "$name"
fi

docker run --name "$name" --restart always -d upwork-tele-notify:latest

sleep 5
docker logs "$name"