# AI Manus Unified

<div align="center">

![AI Manus Unified](https://img.shields.io/badge/AI%20Manus-Unified-6366f1?style=for-the-badge&labelColor=1e1e2e)

**Visual Workflow Automation Platform**

*A powerful AI-powered workflow automation platform combining the best of ai-manus and syria-ai-manus*

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node](https://img.shields.io/badge/Node-20%2B-green)](https://nodejs.org)
[![Python](https://img.shields.io/badge/Python-3.11%2B-blue)](https://python.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0%2B-blue)](https://www.typescriptlang.org/)

</div>

---

## 🚀 Features

### 🧠 Multi-Provider AI Support
- **17+ AI Providers**: OpenAI, Anthropic, Google, DeepSeek, Groq, Mistral, xAI, Cohere, OpenRouter, and more
- **Local AI Support**: Ollama, LMStudio for offline AI capabilities
- **Dynamic Model Selection**: Automatically route to the best model for each task

### 🔄 Visual Workflow Builder
- **Drag-and-Drop Interface**: React Flow powered canvas for intuitive workflow design
- **20+ Pre-built Skills**: Browser automation, code execution, file management, HTTP requests
- **n8n Import**: Import and convert n8n workflows to Manus format
- **Real-time Execution**: Watch workflows execute with live status updates

### ⚡ High-Performance Execution
- **DAG Engine**: Parallel and sequential node execution
- **Streaming Updates**: Server-Sent Events for real-time progress
- **Error Handling**: Automatic retry with exponential backoff
- **Timeout Management**: Configurable timeouts per skill

### 🔌 MCP Tool Integration
- **Filesystem**: Read, write, and manage files
- **Database**: SQLite, PostgreSQL, MongoDB support
- **HTTP**: Make requests to external APIs
- **Shell**: Execute commands in sandboxed environment
- **Browser**: Playwright-powered browser automation

### 🐳 Production Ready
- **Docker Support**: Multi-stage Dockerfile for minimal image size
- **Docker Compose**: Complete stack with MongoDB, Redis, and sandbox
- **Health Checks**: Built-in health monitoring
- **Horizontal Scaling**: Stateless design for easy scaling

---

## 📦 Installation

### Prerequisites
- Node.js 20+
- Python 3.11+
- Docker & Docker Compose (optional)

### Quick Start

```bash
# Clone the repository
git clone https://github.com/your-username/ai-manus-unified.git
cd ai-manus-unified

# Copy environment file
cp .env.example .env

# Edit .env with your API keys
nano .env

# Start with Docker Compose
docker-compose up -d

# Or run manually:

# Backend
cd backend
pip install -r requirements.txt
uvicorn main:app --reload

# Frontend (in another terminal)
cd frontend
npm install
npm run dev
```

---

## 🏗️ Architecture

```
ai-manus-unified/
├── backend/
│   ├── main.py                 # FastAPI application entry point
│   ├── skills/
│   │   ├── skill_registry.py   # Skill definitions and registry
│   │   └── mcp_tools.py        # MCP tool integrations
│   ├── workflow/
│   │   ├── workflow_runner.py  # DAG execution engine
│   │   └── n8n_parser.py       # n8n workflow converter
│   └── api/
│       └── workflow_routes.py  # REST API endpoints
├── frontend/
│   └── src/
│       └── components/
│           └── workflow/
│               └── WorkflowBuilder.tsx  # React Flow canvas
├── Dockerfile
├── docker-compose.yml
└── README.md
```

---

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `OPENAI_API_KEY` | OpenAI API key | - |
| `ANTHROPIC_API_KEY` | Anthropic API key | - |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Google AI API key | - |
| `DEEPSEEK_API_KEY` | DeepSeek API key | - |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017` |
| `REDIS_URL` | Redis connection string | `redis://localhost:6379` |
| `JWT_SECRET_KEY` | JWT signing secret | (required) |

See [.env.example](.env.example) for all configuration options.

---

## 📚 API Documentation

### Workflow Endpoints

```http
GET    /api/workflows              # List all workflows
POST   /api/workflows              # Create a workflow
GET    /api/workflows/{id}         # Get workflow by ID
PUT    /api/workflows/{id}         # Update workflow
DELETE /api/workflows/{id}         # Delete workflow
POST   /api/workflows/execute      # Execute a workflow
POST   /api/workflows/execute/stream  # Execute with SSE streaming
GET    /api/executions/{id}        # Get execution status
```

### Skills Endpoints

```http
GET    /api/workflows/skills       # List all available skills
GET    /api/workflows/skills/{id}  # Get skill details
GET    /api/workflows/skills/categories  # List skill categories
```

### n8n Import

```http
POST   /api/workflows/import/n8n   # Import n8n workflow
POST   /api/workflows/import/n8n/preview  # Preview import
```

### Interactive Docs

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

---

## 🧩 Available Skills

### Cognitive & AI Reasoning
| Skill | Description |
|-------|-------------|
| `dynamic_planner` | AI-powered workflow path decision making |
| `data_extractor` | Extract structured data from unstructured text |
| `document_summarizer` | Summarize long documents |

### Web & Research
| Skill | Description |
|-------|-------------|
| `browser_operator` | Navigate and interact with web pages |
| `wide_researcher` | Multi-source web research |
| `http_request` | Make HTTP requests to APIs |

### Execution & Development
| Skill | Description |
|-------|-------------|
| `python_sandbox` | Execute Python code securely |
| `bash_commander` | Run shell commands |
| `file_manager` | File system operations |

### External Integrations (MCP)
| Skill | Description |
|-------|-------------|
| `n8n_webhook` | Trigger n8n workflows |
| `database_operator` | SQL database operations |

---

## 🔄 n8n Compatibility

AI Manus Unified can import workflows from n8n:

```python
from workflow.n8n_parser import N8NParser

parser = N8NParser()
manus_workflow = parser.parse_file("n8n-export.json")
```

### Supported n8n Nodes

| n8n Node | Manus Skill |
|----------|-------------|
| HTTP Request | `http_request` |
| Code | `python_sandbox` |
| Execute Command | `bash_commander` |
| Read/Write File | `file_manager` |
| PostgreSQL/MySQL/SQLite | `database_operator` |
| Webhook | `trigger_webhook` |
| IF/Switch | `dynamic_planner` |

---

## 🐳 Docker Deployment

### Development

```bash
docker-compose up -d
```

### Production

```bash
docker-compose --profile production up -d
```

This enables the Nginx reverse proxy with SSL termination.

---

## 🧪 Testing

```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
npm test
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [ai-manus](https://github.com/simpleyyt/ai-manus) - Original agent runtime and sandbox
- [syria-ai-manus](https://github.com/sadadonline17-oss/syria-ai-manus) - Additional providers and integrations
- [React Flow](https://reactflow.dev/) - Visual workflow canvas
- [FastAPI](https://fastapi.tiangolo.com/) - Modern Python web framework
- [Vercel AI SDK](https://sdk.vercel.ai/) - AI provider abstraction

---

<div align="center">

**Built with ❤️ by the AI Manus Unified Team**

</div>