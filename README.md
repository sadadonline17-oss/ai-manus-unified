# AI Manus Unified

> **Unified AI Agent Enterprise Platform** - A production-ready, modular, and scalable AI orchestration platform that merges the best of [ai-manus](https://github.com/simpleyyt/ai-manus) and [syria-ai-manus](https://github.com/sadadonline17-oss/syria-ai-manus).

## 🚀 Features

### Multi-Provider Support
- **OpenAI** - GPT-4o, GPT-4 Turbo, o1, o3-mini
- **Anthropic** - Claude 3.5 Sonnet, Claude 3 Opus, Claude 3 Haiku
- **Google** - Gemini 2.0 Flash, Gemini 1.5 Pro
- **DeepSeek** - DeepSeek Chat, DeepSeek Reasoner
- **Groq** - Llama, Mixtral (high-speed inference)
- **Mistral** - Mistral Large, Mistral Medium
- **xAI** - Grok models
- **Cohere** - Command R+, Command R
- **OpenRouter** - Access to 100+ models
- **Ollama** - Local LLM support
- **LMStudio** - Local model support
- **Together AI**, **Perplexity**, **HuggingFace**, **Moonshot**, **Hyperbolic**, **GitHub Models**, **Amazon Bedrock**

### Tool System
- **Shell Tools** - Execute commands in sandbox environment
- **File Tools** - Read, write, search, and manage files
- **Browser Tools** - Navigate, click, input, screenshot
- **Search Tools** - Web search with Google, Bing, Baidu

### Orchestrator
- **Auto Provider Routing** - Intelligent provider selection
- **Failover Support** - Automatic fallback between providers
- **Retry with Backoff** - Resilient error handling
- **Health Monitoring** - Real-time provider health checks
- **Cost-Aware Routing** - Optimize for cost efficiency
- **Region-Based Routing** - Geographic optimization

## 📁 Project Structure

```
ai-manus-unified/
├── src/
│   ├── providers/          # AI provider implementations
│   │   ├── interface.ts    # Provider interface contract
│   │   ├── registry.ts     # Dynamic provider registration
│   │   ├── openai.ts       # OpenAI provider
│   │   ├── anthropic.ts    # Anthropic provider
│   │   ├── additional.ts   # All other providers
│   │   └── index.ts        # Provider initialization
│   ├── tools/              # Tool implementations
│   │   ├── interface.ts    # Tool interface contract
│   │   ├── registry.ts     # Dynamic tool registration
│   │   ├── shell.ts        # Shell execution tools
│   │   ├── file.ts         # File operation tools
│   │   ├── browser.ts      # Browser automation tools
│   │   ├── search.ts       # Web search tools
│   │   └── index.ts        # Tool initialization
│   ├── orchestrator/       # Provider orchestration
│   │   └── index.ts        # Routing, failover, health
│   ├── agent/              # Agent runtime
│   │   ├── base.ts         # Base agent implementation
│   │   └── index.ts        # Agent factory
│   ├── config/             # Configuration management
│   │   └── index.ts        # Config loader & validation
│   ├── types/              # TypeScript definitions
│   │   └── index.ts        # All type definitions
│   └── index.ts            # Main server entry point
├── .github/workflows/      # CI/CD pipelines
│   └── ci.yml              # Build, test, deploy
├── Dockerfile              # Multi-stage Docker build
├── docker-compose.yml      # Full stack deployment
├── package.json            # Dependencies & scripts
├── tsconfig.json           # TypeScript configuration
└── .env.example            # Environment template
```

## 🏃 Quick Start

### Prerequisites
- Node.js 20+ or Bun
- Docker (optional, for containerized deployment)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd ai-manus-unified

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env and add your API keys
nano .env

# Build the project
npm run build

# Start the server
npm start
```

### Development

```bash
# Run in development mode with hot reload
npm run dev

# Run type checking
npm run typecheck

# Run linting
npm run lint

# Run tests
npm test
```

### Docker Deployment

```bash
# Build Docker image
docker build -t ai-manus-unified .

# Run container
docker run -p 3000:3000 --env-file .env ai-manus-unified

# Or use docker-compose for full stack
docker-compose up -d
```

## 📡 API Endpoints

### Health & Status
- `GET /` - Server info
- `GET /health` - Health check
- `GET /stats` - System statistics

### Providers
- `GET /providers` - List all providers
- `GET /providers/:name` - Get provider details
- `GET /providers/:name/health` - Provider health check

### Models
- `GET /models` - List all available models

### Tools
- `GET /tools` - List all tools
- `GET /tools/:name` - Get tool details
- `POST /tools/:name/execute` - Execute a tool

### Chat
- `POST /chat` - Generate completion
- `POST /chat/stream` - Stream completion (SSE)

### Agents
- `POST /agents` - Create agent
- `GET /agents` - List agents
- `GET /agents/:id` - Get agent state
- `POST /agents/:id/execute` - Execute agent task (SSE)
- `DELETE /agents/:id` - Delete agent

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment | `development` |
| `PORT` | Server port | `3000` |
| `HOST` | Server host | `0.0.0.0` |
| `OPENAI_API_KEY` | OpenAI API key | - |
| `ANTHROPIC_API_KEY` | Anthropic API key | - |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Google AI key | - |
| `DEEPSEEK_API_KEY` | DeepSeek API key | - |
| `GROQ_API_KEY` | Groq API key | - |
| `MISTRAL_API_KEY` | Mistral API key | - |
| `OPEN_ROUTER_API_KEY` | OpenRouter API key | - |
| `XAI_API_KEY` | xAI API key | - |
| `COHERE_API_KEY` | Cohere API key | - |
| `OLLAMA_API_BASE_URL` | Ollama base URL | `http://127.0.0.1:11434` |
| `MONGODB_URI` | MongoDB connection | `mongodb://localhost:27017` |
| `REDIS_HOST` | Redis host | `localhost` |

See `.env.example` for complete configuration options.

## 📋 Conflict Resolution Summary

### Repository Analysis

| Aspect | ai-manus | syria-ai-manus |
|--------|----------|----------------|
| Language | Python (FastAPI) | TypeScript (Hono/Bun) |
| Providers | OpenAI (via openai package) | 20+ providers (via AI SDK) |
| Tools | Python-based tools | TypeScript-based tools |
| Frontend | Vue.js | React Native/Expo |
| Database | MongoDB, Redis | Supabase |

### Merge Decisions

#### 1. Runtime Stack
- **Decision**: TypeScript/Node.js with Hono framework
- **Rationale**: Better AI SDK support, unified with syria-ai-manus approach, Bun compatibility

#### 2. Provider System
- **Source**: syria-ai-manus (comprehensive provider list)
- **Enhancement**: Added unified interface from ai-manus patterns
- **Result**: 17+ providers with standardized interface

#### 3. Tool System
- **Source**: ai-manus (Python tools)
- **Action**: Ported to TypeScript with enhanced interface
- **Tools Merged**: Shell, File, Browser, Search, Message, Plan

#### 4. Agent Runtime
- **Source**: ai-manus (agent domain service)
- **Action**: Rewritten in TypeScript with same patterns
- **Enhancement**: Added event-based streaming, tool registry integration

#### 5. Orchestrator
- **Source**: New implementation
- **Features**: Combined best practices from both repos
- **Capabilities**: Failover, health monitoring, cost-aware routing

#### 6. Environment Variables
- **Action**: Merged all env vars from both repos
- **Normalization**: Standardized naming (e.g., `OPENAI_API_KEY`)
- **Result**: Single `.env.example` with all options

#### 7. Frontend
- **Decision**: Not included in core platform
- **Rationale**: API-first design allows any frontend
- **Reference**: Both Vue.js and React Native frontends available in source repos

### Removed Duplicates

| Component | Source | Action |
|-----------|--------|--------|
| OpenAI client | Both repos | Unified to AI SDK |
| Tool definitions | Both repos | Merged into registry |
| Config loading | Both repos | Unified config manager |
| Auth system | Both repos | Unified JWT-based auth |

### Dependency Resolution

| Package | Version | Source |
|---------|---------|--------|
| `ai` | ^6.0.78 | syria-ai-manus |
| `@ai-sdk/*` | Latest | syria-ai-manus |
| `hono` | ^4.9.10 | syria-ai-manus |
| `zod` | ^3.25.76 | syria-ai-manus |
| `playwright` | ^1.42.0 | ai-manus |
| `dockerode` | ^4.0.2 | ai-manus |
| `mongoose` | ^8.9.0 | ai-manus |
| `ioredis` | ^5.4.1 | ai-manus |

## 🧪 Validation Checklist

- [x] TypeScript compiles without errors
- [x] All providers implement interface
- [x] All tools implement interface
- [x] Server starts successfully
- [x] Health endpoint responds
- [x] Provider registration works
- [x] Tool registration works
- [x] Docker build succeeds
- [x] Docker compose validates
- [x] CI workflow configured

## 📄 License

MIT License - See LICENSE file for details.

## 🙏 Acknowledgments

- [ai-manus](https://github.com/simpleyyt/ai-manus) - Original Python implementation
- [syria-ai-manus](https://github.com/sadadonline17-oss/syria-ai-manus) - TypeScript implementation with extended providers
- [Vercel AI SDK](https://sdk.vercel.ai) - Unified AI provider interface
- [Hono](https://hono.dev) - Fast, lightweight web framework