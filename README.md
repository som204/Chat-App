<div align="center">  
  <h1 align="center">  
    <span style="font-family: monospace; font-size: 36px; font-weight: bold;">Code</span><span style="font-family: monospace; font-size: 36px; font-weight: 300; color: #6b7280;">Less</span>  
  </h1>  
  <p align="center">  
    Build at the Speed of Thought. An AI‑powered, collaborative workspace that turns your ideas into production‑ready code.  
    <br />   
    <a href="https://codeless.live">View Demo</a> 
  </p>  
</div>

---


## 📖 About The Project

**Codeless** is a powerful AI-driven no-code/low-code platform that enables seamless collaborative software development. It combines the power of a **Gemini-powered AI assistant** with real-time, multi-user collaboration, all running in a sandboxed browser environment powered by **WebContainers**.

Whether you're a solo developer prototyping an idea or a team building a complex application, Codeless provides the tools to go from concept to live preview in minutes. **Stop scaffolding, and start creating.**

---

## ✨ Key Features

* **🤖 AI Co-pilot:** Use the `@ai` prefix in the chat to prompt the AI. Generate components, write functions, debug code, or build entire application structures with natural language.
* **👥 Real-time Collaboration:** Invite your team to a project and code together in the same editor. See cursors, selections, and changes live, just like in Google Docs.
* **⚡ Instant Live Preview:** Every change is instantly hot-reloaded in a live preview pane, powered by WebContainers. No more context switching or manual refreshes.
* **💬 Integrated Chat:** Each project has a dedicated chat room for seamless communication with your collaborators and the AI.
* **📁 Cloud-Synced File System:** A fully-featured file explorer allows you to create, rename, and delete files and folders, which are automatically synced to AWS S3.
* **💅 Modern UI/UX:** A beautiful, responsive interface with a persistent black and white theme and a dark mode toggle, built with **shadcn/ui** and **magic-ui**.
* **🔗 GitHub Integration:** Seamlessly interact with your GitHub repositories by simply commanding the AI. Clone, commit, push, create branches, and manage pull requests—all through natural language instructions.

---
## 🧩 Live Demo

<div align="center">

[![Live Demo](https://img.shields.io/badge/🚀%20Try%20Codeless%20Live-Click%20Here-4F46E5?style=for-the-badge&logo=vercel&logoColor=white)](https://codeless.live)

<br />

Experience **Codeless** in action—no installation required.  
Click the button above to launch the live workspace and start building instantly!

</div>

---

## 🛠️ Tech Stack

This project leverages a modern and powerful tech stack to deliver a seamless user experience.

| Category                | Technology                                                                                                  |
| ----------------------- | ----------------------------------------------------------------------------------------------------------- |
| **Frontend** | [React](https://reactjs.org/), [Tailwind CSS](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/), [Framer Motion](https://www.framer.com/motion/) |
| **Backend** | [Node.js](https://nodejs.org/), [Express.js](https://expressjs.com/)                                         |
| **Real-time** | [Socket.IO](https://socket.io/), [Redis](https://redis.io/)                                                  |
| **In-Browser Environment**| [WebContainers](https://webcontainers.io/) by StackBlitz                                                    |
| **Database** | [MongoDB](https://www.mongodb.com/)                                                                         |
| **Authentication** | JWT, Cookies                                                                                                |
| **Cloud Storage** | [AWS S3](https://aws.amazon.com/s3/)                                                                        |
| **AI Integration** | [Google Gemini](https://ai.google.dev/gemini-api/docs)                                                      |
| **Deployment** | [Docker](https://www.docker.com/), [GitHub Actions](https://github.com/features/actions) |

---

## 🚀 Getting Started

To get a local copy up and running, follow these simple steps. We recommend using Docker for the simplest setup.

### Prerequisites

* **Node.js** (v18 or later)
* **npm**
* **Docker** and **Docker Compose**

### Installation & Setup

1.  **Clone the repository**
    ```sh
    git clone https://github.com/som204/Chat-App.git
    cd your-repo
    ```

2.  **Set up your environment variables**
    Create a `.env` file in the root directory by copying the example file:
    ```sh
    cp .env.example .env
    ```
    Now, open the `.env` file and add your configuration keys:
    ```env
    # MongoDB
    MONGO_URI=your_mongo_uri_here
    JWT_SECRET=your_jwt_secret_here

    # Redis
    REDIS_PASSWORD=your_redis_password_here
    REDIS_HOST=your_redis_host_here
    REDIS_PORT=your_redis_port_here

    # Google & AI
    GOOGLE_API_KEY=your_google_api_key_here
    GOOGLE_API_KEY_2=your_google_api_key_2_here
    GOOGLE_CSE_ID=your_google_cse_id_here

    # AWS S3
    AWS_ACCESS_KEY=your_aws_access_key_here
    AWS_SECRET_KEY=your_aws_secret_key_here
    AWS_BUCKET_NAME=your_aws_bucket_name_here
    ```

3.  **Build and run with Docker**
    This is the recommended method as it handles all dependencies and services.
    ```sh
    docker compose up --build
    ```

The application should now be running and accessible at `http://localhost`.

---

## 🎥 Video Demonstration

Watch a quick walkthrough of Codeless in action:

[![Watch the demo](https://img.youtube.com/vi/your_video_id_here/0.jpg)](https://www.youtube.com/watch?v=your_video_id_here)

> _Click the image above or [view the demo on YouTube](https://www.youtube.com/watch?v=your_video_id_here)._  
> _(Replace the link with your actual demo video when available.)_

---

## 📧 Contact

- **Som Prasad** - Developer & Maintainer
- **somprasad240@gmail.com** - For any inquiries or suggestions, feel free to reach out
- **Open to Contributions!** Feel free to fork and submit pull requests.