#!/bin/bash

name="upwork-tele-notify"

docker build -t  "$name":latest -f ./Dockerfile .