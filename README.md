# Customizable Chatbots Platform

A comprehensive platform for creating, managing, and analyzing customizable chatbots with an advanced analytics dashboard.

## Features

- **Chatbot Creation & Management**: Create and manage multiple chatbots with customizable templates
- **Conversation Management**: Track and analyze conversations across all chatbots
- **Template Management**: Create and manage reusable templates for quick chatbot deployment
- **Analytics Dashboard**: Comprehensive analytics for monitoring chatbot performance
- **User Engagement Tracking**: Monitor user interactions and engagement metrics
- **Response Quality Analysis**: Analyze response quality and sentiment

## Analytics Dashboard

The Analytics Dashboard provides comprehensive insights into chatbot performance, user engagement, and response quality. Key features include:

- **Overview Panel**: Key metrics and trends at a glance
- **Conversations Panel**: Detailed conversation metrics and distributions
- **Templates Panel**: Template usage statistics and performance
- **User Engagement Panel**: User metrics, retention, and session data
- **Response Quality Panel**: Response time, sentiment, and quality metrics

## Project Structure

```
├── docs/                  # Documentation files
│   ├── analytics-dashboard-implementation.md
│   └── analytics-dashboard-next-steps.md
├── scripts/               # Utility scripts
│   ├── validate-analytics-endpoints.js
│   └── test-analytics-dashboard-ui.js
├── src/
│   ├── api/               # Backend API
│   │   ├── controllers/
│   │   └── routes/
│   ├── frontend/          # Frontend components
│   │   ├── components/
│   │   │   ├── AnalyticsDashboard/
│   │   │   │   ├── panels/
│   │   │   │   └── AnalyticsDashboard.css
│   │   │   └── common/
│   │   └── services/
│   └── utils/             # Utility functions
├── test-results/          # Test results and reports
└── README.md
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MongoDB

### Installation

1. Clone the repository:
```bash
git clone https://github.com/qaaph-zyld/customizable-chatbots.git
cd customizable-chatbots
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

## Testing

Run the automated tests:

```bash
npm test
```

Validate API endpoints:

```bash
node scripts/validate-analytics-endpoints.js
```

Test UI integration:

```bash
node scripts/test-analytics-dashboard-ui.js
```

## Documentation

- [Analytics Dashboard Implementation](docs/analytics-dashboard-implementation.md)
- [Analytics Dashboard Next Steps](docs/analytics-dashboard-next-steps.md)

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- React Bootstrap for UI components
- Recharts for data visualization
- Axios for API communication