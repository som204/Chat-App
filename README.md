# Codeless

## Overview

Codeless is a platform designed to facilitate collaborative software development with a **no-code/low-code** approach. It enables users to create and manage projects efficiently with real-time collaboration features.

## Features

- **Live Collaboration:** Users can edit and manage projects in real time.
- **WebSockets Integration:** Ensures instant updates and seamless interaction.
- **Secure API Communication:** Uses JWT authentication for secure access.
- **Customizable Components:** Provides reusable UI components for faster development.
- **Built-in Deployment:** Allows easy project hosting and management.
- **AI-Powered Assistance** Get intelligent code suggestions, auto-completions, and debugging insights.

## Tech Stack

- **Frontend:** React, Vite, TailwindCSS, Material-UI, React Icons
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (via Mongoose ORM)
- **Authentication:** JWT-based authentication
- **Real-time Communication:** WebSockets (Socket.io)
- **Server & Deployment:** Nginx, PM2 for process management
- **Cloud Storage** AWS S3


## Backend

### File Structure
```
📂 Backend
│── 📄 .env
│── 📄 .gitignore
│── 📄 app.js
│── 📄 package.json
│── 📄 server.js
│
├── 📂 Controllers
│   ├── 📄 ai.controller.js
│   ├── 📄 cloud.controller.js
│   ├── 📄 project.controller.js
│   ├── 📄 user.controller.js
│
├── 📂 Db
│   ├── 📄 db.js
│
├── 📂 Middleware
│   ├── 📄 auth.middleware.js
│
├── 📂 Models
│   ├── 📄 project.model.js
│   ├── 📄 user.model.js
│
├── 📂 Routes
│   ├── 📄 ai.routes.js
│   ├── 📄 cloud.routes.js
│   ├── 📄 project.routes.js
│   ├── 📄 user.routes.js
│
├── 📂 Services
│   ├── 📄 ai.service.js
│   ├── 📄 cloud.service.js
│   ├── 📄 project.service.js
│   ├── 📄 redis.service.js
│   ├── 📄 user.service.js
```

## Environment Variables

The following environment variables need to be set for the backend to function correctly:

| Variable Name      | Description                          |
|--------------------|--------------------------------------|
| `MONGO_URI`       | MongoDB connection string           |
| `JWT_SECRET`      | Secret key for JWT authentication   |
| `AWS_ACCESS_KEY`  | AWS access key for S3               |
| `AWS_SECRET_KEY`  | AWS secret key for S3               |
| `AWS_BUCKET_NAME` | AWS S3 bucket name                  |
| `GOOGLE_AI_KEY`   | Google AI API key                   |
| `REDIS_HOST`      | Redis server host                   |
| `REDIS_PORT`      | Redis server port                   |
| `REDIS_PASSWORD`  | Redis server password               |

Make sure to configure these variables in your `.env` file before running the project.

## Frontend

### File Structure

Frontend File Structure:
```
📂 public
│   📄 favicon.ico
│   📄 index.html
│   📄 robots.txt
📂 src
│   📂 components
│   │   📄 Chat.jsx
│   │   📄 Home.jsx
│   │   └── ...
│   📂 context
│   │   📄 user.context.js
│   📂 config
│   │   📄 socket.js
│   📄 App.jsx
│   📄 index.css
│   📄 main.jsx
│   └── ...
📄 .gitignore
📄 package.json
📄 README.md
📄 vite.config.js
```
## Installation

### Prerequisites

- Node.js
- MongoDB

### Steps

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-repo/codeless.git
   cd Backend
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Set up environment variables:**
   Create a `.env` file in the root directory and configure in both Backend and Frontend

4. **Run the server:**
   ```bash
   npm server.js
   ```
5. **Run the frontend:**
   ```bash
   cd Frontend
   npm install
   npm run dev
   ```

## Screenshots

### Homepage
![codeless live_](https://github.com/user-attachments/assets/f402ef24-259b-4230-8c11-2822d97a1655)

### Project Dashboard
![codeless live_home](https://github.com/user-attachments/assets/247434c7-5107-4328-966a-2d88082f1abd)

### Chat Room
![codeless live_home (1)](https://github.com/user-attachments/assets/83c0c94d-fb51-4673-81fc-86fbb9fe1d70)
![codeless live_chat_67b9cbb8c5f3b7ac44aa879b](https://github.com/user-attachments/assets/ddf3acdf-6f18-4f8d-9fbf-33a576e2f639)
![codeless live_chat_67b9cbb8c5f3b7ac44aa879b (1)](https://github.com/user-attachments/assets/fd33aacd-0cf9-431d-aa1f-e52d5968bc3e)

### Login
![codeless live_login](https://github.com/user-attachments/assets/8c9e0c50-f192-46c3-9331-bf4fa050df23)

### Register
![codeless live_register](https://github.com/user-attachments/assets/17f776fe-50e8-4df1-8cf8-1afc97b000a2)









## Contributors

- **Som Prasad** - Developer & Maintainer
- **somprasad240@gmail.com** - For any inquiries or suggestions, feel free to reach out
- **Open to Contributions!** Feel free to fork and submit pull requests.



