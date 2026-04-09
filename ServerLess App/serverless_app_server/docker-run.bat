@echo off
REM
REM Windows BATCH script to run docker container
REM
@echo on
docker run -it -u user -w /home/user -v .:/home/user -p 8080:8080 --rm project02-server bash
