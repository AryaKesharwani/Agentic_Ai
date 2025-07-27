# Sahayak - Multi-Agent AI for Teachers

A desktop-only web application designed for teachers who handle multi-grade classrooms in low-resource Indian schools. Sahayak provides a transparent multi-agent AI collaboration interface that makes it appear as though multiple AI agents are working together to support teachers.

## Core Concept

The UI creates the illusion of multiple AI agents collaborating transparently:
- **Orchestrator**: Coordinates the overall workflow
- **Session Memory**: Maintains conversation context
- **Feedback**: Processes user feedback
- **Personaliser**: Adapts content to teacher preferences
- **Suggestions**: Provides actionable suggestions
- **Negotiation**: Handles conflicting proposals
- **Intent Classifier**: Detects user intentions
- **Monitoring**: Tracks user activity
- **Judge**: Self-critiques outputs

## Features

### Agent Workflow Visualization
- Left sidebar with stepper/timeline showing agent steps
- Status indicators: Pending, In Progress, Suspended, Skipped, Completed, Error
- Clickable agent logs with detailed reasoning
- Real-time status updates with micro-interactions

### Chat-like Interface
- Main chat area with agent avatars and message cards
- Inline-editable content for teacher refinements
- Feedback controls (thumbs up/down) with structured feedback dialog
- Suggestion bubbles for quick actions
- Undo functionality for every agent output

### Input Bar
- Multiline text input with character/word count
- Autocomplete for subject and grade metadata
- Intent detection with colored alerts
- Rich text formatting options

### Session Memory Widget
- Collapsible accordion showing stored facts
- Categorized memory items (facts, preferences, context)
- Tooltips with recall commands
- Memory statistics and usage tracking

### Negotiation Dialog
- Side-by-side teacher vs agent proposals
- Accept/reject buttons for each proposal
- Agreement detection and success alerts

### Judge/Self-Critique
- Automatic critique of complex outputs
- Retry/Keep options for teacher control
- Grade-appropriate content validation

### Edge-Case UX
- Monitoring agent for tab inactivity
- Backdrop overlay for paused processing
- Undo functionality for all agent outputs
- Warning alerts for skipped workflow steps

## Technology Stack

- **Frontend**: Next.js 14 with TypeScript
- **Backend**: Next.js API Routes with Gemini AI
- **UI Framework**: Material UI v5+ with Google Material Theme
- **AI Engine**: Google Gemini Pro for content generation
- **State Management**: Zustand with persistence
- **Internationalization**: React Intl (English + Hindi)
- **Charts**: MUI X Charts for quiz results
- **Diagrams**: Mermaid for educational diagrams
- **Code Highlighting**: React Syntax Highlighter

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd sahayak
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# Create .env.local file in the root directory
echo "GEMINI_API_KEY=your_gemini_api_key_here" > .env.local
```

Get your Gemini API key from: https://makersuite.google.com/app/apikey

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── layout.tsx         # Root layout with theme provider
│   ├── page.tsx           # Home page (redirects to chat)
│   └── chat/              # Chat page
│       └── page.tsx       # Main chat interface
├── components/            # React components
│   ├── AgentWorkflow.tsx  # Agent workflow visualization
│   ├── ChatArea.tsx       # Chat interface with feedback
│   ├── InputBar.tsx       # Input with metadata and intent detection
│   ├── MemoryWidget.tsx   # Session memory management
│   ├── Sidebar.tsx        # Teacher profile and session history
│   ├── LanguageToggle.tsx # Language switcher
│   ├── MonitoringBackdrop.tsx # Inactivity monitoring
│   └── NegotiationDialog.tsx # Proposal negotiation interface
├── store/                 # State management
│   └── agentStore.ts      # Zustand store for global state
└── locales/               # Internationalization
    └── messages.ts        # English and Hindi translations
```

## Key Components

### AgentWorkflow
The left sidebar component that visualizes the multi-agent workflow using Material UI's Stepper component. Each agent has a unique avatar, color, and status indicator. Clicking on an agent opens a detailed logs drawer.

### MemoryWidget
A collapsible accordion that displays session memory items categorized by type (facts, preferences, context). Each memory item shows usage count and provides tooltips with recall commands.

### ChatArea
The main chat interface with agent avatars, message cards, and feedback controls. Supports inline editing of teacher messages and displays suggestion bubbles for quick actions.

### InputBar
A sophisticated input area with multiline text support, subject/grade autocomplete, intent detection, and rich text formatting options.

### NegotiationDialog
A modal dialog that shows side-by-side teacher and agent proposals with accept/reject buttons. Automatically detects when agreement is reached.

## State Management

The application uses Zustand for global state management with localStorage persistence. The store manages:

- Current session and session history
- Teacher profile information
- Agent states and logs
- Message history with feedback
- Session memory items
- Language preferences

## Internationalization

The application supports English and Hindi languages using React Intl. All user-facing strings are internationalized and can be easily extended to support additional languages.

## Mock Backend

Since this is a frontend-only implementation, all agent responses and interactions are mocked with realistic timeouts and state changes to simulate a real multi-agent system.

## Desktop-Only Design

The application is optimized for desktop screens (1152px+) and uses Material UI's responsive Grid system to provide an optimal experience for teachers working on larger screens.

## Backend API

### Chat API Endpoint

**POST** `/api/chat`

Processes teacher messages through the multi-agent system and returns AI-generated responses.

#### Request Body:
```json
{
  "message": "Create a worksheet for Mathematics Grade 3",
  "sessionId": "session-12345",
  "subjects": ["Mathematics"],
  "grades": [3],
  "locale": "en"
}
```

#### Response:
```json
{
  "content": "AI-generated response content",
  "intent": {
    "type": "worksheetGeneration",
    "confidence": 87,
    "keywords": ["worksheet", "mathematics"],
    "parameters": {
      "subjects": ["Mathematics"],
      "grades": [3],
      "difficulty": "medium"
    }
  },
  "suggestions": ["makeSimpler", "generateQuiz", "addVisuals"],
  "qualityAssessment": {
    "score": 8,
    "reasoning": "Content is age-appropriate and educationally valuable",
    "suggestions": ["Add examples", "Include visuals"]
  },
  "workflow": [
    {
      "id": "intentClassifier",
      "status": "completed",
      "logs": [...]
    }
  ],
  "memory": [
    {
      "content": "Teacher creates worksheets for Mathematics",
      "type": "fact",
      "timestamp": "2024-01-01T12:00:00Z"
    }
  ]
}
```

### Multi-Agent Workflow

The backend processes each request through 7 specialized agents:

1. **Intent Classifier** - Analyzes user intent (worksheet, lesson plan, etc.)
2. **Session Memory** - Manages context and learning preferences
3. **Orchestrator** - Coordinates overall response generation using Gemini AI
4. **Judge** - Assesses content quality and appropriateness
5. **Personaliser** - Adapts content to user preferences and context
6. **Suggestions** - Generates contextual action suggestions
7. **Monitoring** - Logs activity and performance metrics

### Environment Variables

Create a `.env.local` file with:

```bash
GEMINI_API_KEY=your_gemini_api_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Agent Classes

- **AgentProcessor** (`/src/lib/agents/AgentProcessor.ts`) - Manages workflow execution
- **IntentClassifier** (`/src/lib/agents/IntentClassifier.ts`) - Classifies user intents
- **SessionMemory** (`/src/lib/agents/SessionMemory.ts`) - Handles context storage

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License. 