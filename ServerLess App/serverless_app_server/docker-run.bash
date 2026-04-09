#!/bin/bash
#
# Linux/Mac BASH script to run docker container
#
docker run -it -u user -w /home/user -v .:/home/user -p 8080:8080 --rm project02-server bash
