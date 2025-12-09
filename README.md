# Customizable Chatbots Platform

A full-featured platform for creating AI-powered chatbots with knowledge bases, multi-channel support, and advanced analytics.

![Dashboard Preview](https://via.placeholder.com/800x400?text=Dashboard+Preview)

## Features

### Core
- **AI-Powered Responses** - GPT-4o-mini integration for intelligent conversations
- **Knowledge Base (RAG)** - Train chatbots with your documents using vector embeddings
- **Multi-Channel Support** - Web widget, WhatsApp, SMS, Slack, Facebook Messenger
- **Real-time Chat** - Supabase real-time subscriptions

### Management
- **Chatbot CRUD** - Create and manage multiple chatbots
- **Template System** - Reusable templates with system prompts
- **Conversation Tracking** - Full conversation history and management
- **Analytics Dashboard** - 5 comprehensive analytics panels

### Integrations
- **Webhooks** - Custom webhooks with signature verification
- **Slack** - Direct Slack channel integration
- **WhatsApp/SMS** - Via Twilio
- **Embeddable Widget** - One-line embed code for any website
- **REST API** - Full API access with API key authentication

### Enterprise
- **User Authentication** - Email/password + OAuth via Supabase
- **API Keys** - Generate API keys for external access
- **Row-Level Security** - Multi-tenant data isolation
- **Sentiment Analysis** - Automatic sentiment detection

## Tech Stack

### Backend
- **Node.js** + **Express** - REST API server
- **Supabase** - PostgreSQL database, Auth, Real-time
- **OpenAI** - GPT-4o-mini for AI responses, Ada-002 for embeddings
- **Twilio** - WhatsApp and SMS integration

### Frontend
- **React 18** + **TypeScript** - UI framework
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **Recharts** - Data visualization
- **Lucide React** - Icons
- **Zustand** - State management
- **Supabase JS** - Auth and real-time

## Project Structure

```
customizable-chatbots/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Shared components
│   │   ├── pages/          # Page components
│   │   ├── lib/            # API client & utilities
│   │   └── main.tsx        # Entry point
│   └── package.json
├── server/                 # Express backend
│   ├── src/
│   │   ├── routes/         # API routes
│   │   ├── data/           # In-memory data store
│   │   └── index.js        # Entry point
│   └── package.json
├── docs/                   # Documentation
└── package.json            # Root package.json
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/qaaph-zyld/customizable-chatbots.git
cd customizable-chatbots
```

2. Install all dependencies:
```bash
npm run install:all
```

Or install manually:
```bash
npm install
cd server && npm install
cd ../client && npm install
```

3. Start the development servers:
```bash
npm run dev
```

This will start:
- Backend API at `http://localhost:3001`
- Frontend at `http://localhost:5173`

## API Endpoints

### Chatbots
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/chatbots` | Get all chatbots |
| GET | `/api/chatbots/:id` | Get chatbot by ID |
| POST | `/api/chatbots` | Create chatbot |
| PUT | `/api/chatbots/:id` | Update chatbot |
| DELETE | `/api/chatbots/:id` | Delete chatbot |
| POST | `/api/chatbots/:id/toggle-status` | Toggle active/inactive |

### Templates
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/templates` | Get all templates |
| GET | `/api/templates/:id` | Get template by ID |
| POST | `/api/templates` | Create template |
| PUT | `/api/templates/:id` | Update template |
| DELETE | `/api/templates/:id` | Delete template |

### Conversations
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/conversations` | Get all conversations |
| POST | `/api/conversations` | Start new conversation |
| POST | `/api/conversations/:id/messages` | Send message |

### Analytics Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/analytics-dashboard/overview` | Overview metrics |
| GET | `/api/analytics-dashboard/conversations` | Conversation analytics |
| GET | `/api/analytics-dashboard/templates` | Template analytics |
| GET | `/api/analytics-dashboard/user-engagement` | User engagement |
| GET | `/api/analytics-dashboard/response-quality` | Response quality |

## Screenshots

### Dashboard
![Dashboard](https://via.placeholder.com/600x300?text=Dashboard)

### Chatbots Management
![Chatbots](https://via.placeholder.com/600x300?text=Chatbots)

### Analytics
![Analytics](https://via.placeholder.com/600x300?text=Analytics)

### Chat Widget
![Chat Widget](https://via.placeholder.com/600x300?text=Chat+Widget)

## Documentation

- [Analytics Dashboard Implementation](docs/analytics-dashboard-implementation.md)
- [Analytics Dashboard Next Steps](docs/analytics-dashboard-next-steps.md)

## Roadmap

### Completed 
- [x] Supabase integration (PostgreSQL, Auth, Real-time)
- [x] User authentication (Email/password, OAuth)
- [x] AI/LLM integration (OpenAI GPT-4o-mini)
- [x] Knowledge Base with RAG (Vector embeddings)
- [x] Embeddable chat widget
- [x] Multi-channel support (WhatsApp, SMS, Slack)
- [x] Webhooks system
- [x] API key authentication

### Planned
- [ ] Export reports (CSV, PDF)
- [ ] Custom AI model support (Claude, Llama)
- [ ] A/B testing for chatbot responses
- [ ] Advanced analytics with ML insights
- [ ] Team collaboration features
- [ ] White-label support

## Environment Setup

### Server (.env)
```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key
OPENAI_API_KEY=your_openai_key
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
```

### Client (.env)
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Acknowledgments

- React for the UI framework
- Recharts for data visualization
- TailwindCSS for styling
- Lucide for icons