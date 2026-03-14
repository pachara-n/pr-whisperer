# PR Whisperer 🤖

PR Whisperer is an AI-powered Pull Request Review Bot built with **NestJS**. It automatically analyzes GitHub Pull Requests for security vulnerabilities and performance bottlenecks using the **Groq API** (Llama 3.3 70B).

## ✨ Features
- **Security Analysis**: Detects SQL Injections, Hardcoded Secrets, and Unsafe function calls (`eval`).
- **Performance Audit**: Identifies O(n^2) loops, inefficient data filtering, and resource leaks.
- **Idempotency**: Uses **Redis** to ensure each webhook event is processed exactly once.
- **Size Aware**: Automatically skips PRs with large diffs to optimize costs and accuracy.
- **Async Processing**: Responds to GitHub immediately while processing the AI review in the background.

## 🛠️ Tech Stack
- **Framework**: [NestJS](https://nestjs.com/)
- **AI Model**: [Groq Cloud](https://groq.com/) (Llama-3.3-70b-versatile)
- **Database**: [Redis](https://redis.io/) (for caching delivery IDs)
- **API Clients**: [Octokit](https://github.com/octokit/rest.js) (GitHub), [Groq SDK](https://github.com/groq/groq-typescript)
- **Infrastructure**: Docker Compose (for local Redis)

## 📁 Project Structure
```text
src/
├── ai/         # Integration with Groq AI SDK
├── github/     # GitHub API (Diff fetching, Commenting)
├── redis/      # Caching and Idempotency logic
├── webhook/    # Webhook orchestration (Controller & Service)
├── app.module.ts
└── main.ts
```

## 🚀 Getting Started

### 1. Prerequisites
- Docker & Docker Compose
- Node.js (v18+)
- [Ngrok](https://ngrok.com/) account (for local testing)

### 2. Installation
```bash
npm install
docker-compose up -d
```

### 3. Environment Setup
Create a `.env` file based on `.env.example`:
```env
GITHUB_PAT=your_personal_access_token
GITHUB_WEBHOOK_SECRET=your_secret
GROQ_API_KEY=your_groq_api_key
```

### 4. Running Locally
```bash
# Start the server
npm run start:dev

# Start the Ngrok tunnel
npx ngrok http 3000
```

### 5. Webhook Configuration
1. Go to your GitHub Repository -> Settings -> Webhooks.
2. Set **Payload URL** to: `https://your-ngrok-url.ngrok-free.app/webhook/github`
3. Set **Content type** to: `application/json`
4. Select **Pull requests** event.

## 📝 License
MIT
