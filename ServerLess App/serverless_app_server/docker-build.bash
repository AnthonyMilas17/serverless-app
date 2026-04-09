#!/bin/bash
#
# Linux/Mac BASH script to build docker container
#
docker rmi project02-server
docker build -t project02-server .
