# 📸 Serverless Photo App

A full-stack photo sharing application that allows users to upload and view photos. Built with a Node.js/Express backend and Python client, containerized with Docker, and powered by AWS services.

---

## Architecture

```
Client (Python)  <-->  Server (Node.js/Express)  <-->  AWS S3 (photo storage)
                                                   <-->  AWS RDS (user/metadata DB)
```

- **Client**: Python-based CLI client for uploading and retrieving photos
- **Server**: Node.js/Express REST API handling authentication, image processing, and AWS integration
- **Storage**: AWS S3 for photo files, AWS RDS (MySQL) for user accounts and metadata
- **Containerization**: Both client and server are fully Dockerized

---

## Features

- Upload photos to cloud storage via the command-line client
- View and retrieve stored photos
- User authentication with bcrypt-hashed credentials
- Image compression and color processing on upload
- Encryption/decryption support for photos

---

## Prerequisites

- [Docker](https://www.docker.com/)
- An AWS account with:
  - An S3 bucket created
  - An RDS (MySQL) instance running
  - IAM credentials with S3 and RDS access
- AWS Access Key ID and Secret Access Key

---

## Configuration

### Server
Copy the config template and fill in your AWS credentials and RDS details:

```
ServerLess App/serverless_app_server/photoapp-config.ini
```

```ini
[s3]
bucket_name = YOUR_S3_BUCKET_NAME
region = YOUR_AWS_REGION

[rds]
endpoint = YOUR_RDS_ENDPOINT
port = 3306
database = YOUR_DB_NAME
username = YOUR_DB_USERNAME
password = YOUR_DB_PASSWORD

[s3readonly]
aws_access_key_id = YOUR_ACCESS_KEY
aws_secret_access_key = YOUR_SECRET_KEY
```

> ⚠️ **Never commit your actual credentials.** This file is in `.gitignore` for a reason.

### Client
Fill in the corresponding client config:

```
ServerLess App/serverless_app_client/photoapp-client-config.ini
```

---

## Running with Docker

### Server
```bash
cd "ServerLess App/serverless_app_server"

# Build
./docker-build.bash      # Mac/Linux
docker-build.bat         # Windows

# Run
./docker-run.bash        # Mac/Linux
docker-run.bat           # Windows
```

### Client
```bash
cd "ServerLess App/serverless_app_client"

# Build
./docker-build.bash      # Mac/Linux
docker-build.bat         # Windows

# Run
./docker-run.bash        # Mac/Linux
docker-run.bat           # Windows
```

---

## API Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/user` | Register a new user |
| GET | `/users` | List all users |
| GET | `/user/:userid` | Get a specific user |
| POST | `/image` | Upload a photo |
| GET | `/image/:assetid` | Retrieve a photo |
| GET | `/assets` | List all assets |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Server | Node.js, Express |
| Client | Python |
| Database | AWS RDS (MySQL) |
| File Storage | AWS S3 |
| Auth | bcrypt |
| Containerization | Docker |

---

## Security Notes

- Passwords are hashed using bcrypt before storage
- Photos support optional encryption/decryption
- AWS credentials must be stored in config files that are excluded from version control via `.gitignore`
- Never expose your IAM keys publicly — rotate them immediately if accidentally committed
