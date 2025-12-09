# Customizable Chatbots Platform

A comprehensive platform for creating, managing, and analyzing customizable chatbots with an advanced analytics dashboard.

![Dashboard Preview](https://via.placeholder.com/800x400?text=Dashboard+Preview)

## Features

- **Chatbot Creation & Management**: Create and manage multiple chatbots with customizable templates
- **Conversation Management**: Track and analyze conversations across all chatbots
- **Template Management**: Create and manage reusable templates for quick chatbot deployment
- **Analytics Dashboard**: Comprehensive analytics for monitoring chatbot performance
- **User Engagement Tracking**: Monitor user interactions and engagement metrics
- **Response Quality Analysis**: Analyze response quality and sentiment
- **Chat Widget**: Test your chatbots with an interactive chat interface

## Tech Stack

### Backend
- **Node.js** + **Express** - REST API server
- **In-memory store** (easily swappable to MongoDB)

### Frontend
- **React 18** + **TypeScript** - UI framework
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **Recharts** - Data visualization
- **Lucide React** - Icons
- **React Router** - Navigation
- **Axios** - HTTP client

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

- [ ] MongoDB integration
- [ ] User authentication
- [ ] AI/LLM integration for chatbot responses
- [ ] Export reports (CSV, PDF)
- [ ] Real-time updates with WebSockets
- [ ] Embeddable chat widget

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Acknowledgments

- React for the UI framework
- Recharts for data visualization
- TailwindCSS for styling
- Lucide for icons