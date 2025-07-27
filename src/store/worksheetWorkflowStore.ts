import { create } from 'zustand';

interface WorkflowStep {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  description: string;
  duration: number;
  status: 'pending' | 'running' | 'completed' | 'error';
  subSteps?: string[];
}

interface WorksheetWorkflowState {
  // Workflow state
  currentStep: number;
  isRunning: boolean;
  progress: number;
  currentSubStep: number;
  
  // Intent and extraction
  showInitialThinking: boolean;
  intentClassified: boolean;
  extractedInfo: any;
  
  // Feedback state
  showFeedback: boolean;
  feedbackGiven: 'positive' | 'negative' | null;
  sampleQuestions: any[];
  isRegenerating: boolean;
  regenerationCount: number;
  
  // Scheduler state
  schedulerOpen: boolean;
  selectedDate: string;
  
  // Workflow steps
  steps: WorkflowStep[];
  
  // Actions
  setCurrentStep: (step: number) => void;
  setIsRunning: (running: boolean) => void;
  setProgress: (progress: number) => void;
  setCurrentSubStep: (subStep: number) => void;
  
  setShowInitialThinking: (show: boolean) => void;
  setIntentClassified: (classified: boolean) => void;
  setExtractedInfo: (info: any) => void;
  
  setShowFeedback: (show: boolean) => void;
  setFeedbackGiven: (feedback: 'positive' | 'negative' | null) => void;
  setSampleQuestions: (questions: any[]) => void;
  setIsRegenerating: (regenerating: boolean) => void;
  setRegenerationCount: (count: number) => void;
  
  setSchedulerOpen: (open: boolean) => void;
  setSelectedDate: (date: string) => void;
  
  updateStepStatus: (stepIndex: number, status: WorkflowStep['status']) => void;
  resetWorkflow: () => void;
  incrementRegenerationCount: () => void;
}

const initialSteps: WorkflowStep[] = [
  {
    id: 'orchestrator',
    name: 'Orchestrator',
    icon: null, // Will be set in component
    color: '#1976d2',
    description: 'Analyzing request and coordinating workflow sequence',
    duration: 2000,
    status: 'pending',
    subSteps: ['Parsing input', 'Identifying workflow', 'Setting up coordination', 'Initializing agents']
  },
  {
    id: 'intent-classifier',
    name: 'Intent Classifier',
    icon: null,
    color: '#ff6f00',
    description: 'Detecting worksheet generation intent from teacher input',
    duration: 2000,
    status: 'pending',
    subSteps: ['Text analysis', 'Pattern matching', 'Intent confidence scoring', 'Context extraction']
  },
  {
    id: 'worksheet-generator',
    name: 'Worksheet Generator',
    icon: null,
    color: '#9c27b0',
    description: 'Running parallel rubric and guardrails generation',
    duration: 2000,
    status: 'pending',
    subSteps: ['Rubric creation', 'Guardrails setup', 'Content framework', 'Quality checks', 'Template generation']
  },
  {
    id: 'personaliser',
    name: 'Personaliser',
    icon: null,
    color: '#7b1fa2',
    description: 'Adapting content for grade level and student context',
    duration: 2000,
    status: 'pending',
    subSteps: ['Grade analysis', 'Language adaptation', 'Difficulty adjustment', 'Cultural context', 'Learning objectives']
  },
  {
    id: 'judge',
    name: 'Judge',
    icon: null,
    color: '#d32f2f',
    description: 'Evaluating appropriateness and educational value',
    duration: 2000,
    status: 'pending',
    subSteps: ['Content review', 'Age appropriateness', 'Learning objectives', 'Quality assurance', 'Educational standards check']
  },
  {
    id: 'feedback',
    name: 'Feedback Collector',
    icon: null,
    color: '#f57c00',
    description: 'Presenting worksheet for teacher approval',
    duration: 0,
    status: 'pending',
  },
  {
    id: 'memory',
    name: 'Memory Agent',
    icon: null,
    color: '#388e3c',
    description: 'Storing successful patterns and preferences',
    duration: 2000,
    status: 'pending',
    subSteps: ['Pattern extraction', 'Preference learning', 'Context storage', 'Knowledge base update']
  },
  {
    id: 'scheduler',
    name: 'Scheduler Agent',
    icon: null,
    color: '#0097a7',
    description: 'Suggesting optimal distribution dates',
    duration: 0,
    status: 'pending',
  },
  // {
  //   id: 'pdf-exporter',
  //   name: 'PDF Exporter',
  //   icon: null,
  //   color: '#5d4037',
  //   description: 'Generating downloadable worksheet PDF',
  //   duration: 2000,
  //   status: 'pending',
  //   subSteps: ['Layout formatting', 'PDF generation', 'Quality verification', 'Metadata embedding']
  // },
  {
    id: 'notifier',
    name: 'Notifier Agent',
    icon: null,
    color: '#6d4c41',
    description: 'Sending notifications to students',
    duration: 2800,
    status: 'pending',
    subSteps: ['Student list compilation', 'Notification dispatch', 'Delivery confirmation']
  }
];

export const useWorksheetWorkflowStore = create<WorksheetWorkflowState>((set, get) => ({
  // Initial state
  currentStep: 0,
  isRunning: false,
  progress: 0,
  currentSubStep: 0,
  
  showInitialThinking: false,
  intentClassified: false,
  extractedInfo: {},
  
  showFeedback: false,
  feedbackGiven: null,
  sampleQuestions: [],
  isRegenerating: false,
  regenerationCount: 0,
  
  schedulerOpen: false,
  selectedDate: '',
  
  steps: initialSteps,
  
  // Actions
  setCurrentStep: (step) => {
    console.log(`Zustand: Setting current step to ${step} - ${get().steps[step]?.name || 'Unknown'}`);
    set({ currentStep: step });
  },
  
  setIsRunning: (running) => {
    console.log(`Zustand: Setting isRunning to ${running}`);
    set({ isRunning: running });
  },
  
  setProgress: (progress) => {
    console.log(`Zustand: Setting progress to ${progress}%`);
    set({ progress });
  },
  
  setCurrentSubStep: (subStep) => set({ currentSubStep: subStep }),
  
  setShowInitialThinking: (show) => {
    console.log(`Zustand: Setting showInitialThinking to ${show}`);
    set({ showInitialThinking: show });
  },
  
  setIntentClassified: (classified) => {
    console.log(`Zustand: Setting intentClassified to ${classified}`);
    set({ intentClassified: classified });
  },
  
  setExtractedInfo: (info) => {
    console.log(`Zustand: Setting extractedInfo:`, info);
    set({ extractedInfo: info });
  },
  
  setShowFeedback: (show) => {
    console.log(`Zustand: Setting showFeedback to ${show}`);
    set({ showFeedback: show });
  },
  
  setFeedbackGiven: (feedback) => {
    console.log(`Zustand: Setting feedbackGiven to ${feedback}`);
    set({ feedbackGiven: feedback });
  },
  
  setSampleQuestions: (questions) => {
    console.log(`Zustand: Setting ${questions.length} sample questions`);
    set({ sampleQuestions: questions });
  },
  
  setIsRegenerating: (regenerating) => {
    console.log(`Zustand: Setting isRegenerating to ${regenerating}`);
    set({ isRegenerating: regenerating });
  },
  
  setRegenerationCount: (count) => {
    console.log(`Zustand: Setting regeneration count to ${count}`);
    set({ regenerationCount: count });
  },
  
  setSchedulerOpen: (open) => {
    console.log(`Zustand: Setting schedulerOpen to ${open}`);
    set({ schedulerOpen: open });
  },
  
  setSelectedDate: (date) => {
    console.log(`Zustand: Setting selectedDate to ${date}`);
    set({ selectedDate: date });
  },
  
  updateStepStatus: (stepIndex, status) => {
    console.log(`Zustand: Updating step ${stepIndex} status to ${status}`);
    set((state) => ({
      steps: state.steps.map((step, index) =>
        index === stepIndex ? { ...step, status } : step
      )
    }));
  },
  
  incrementRegenerationCount: () => {
    const newCount = get().regenerationCount + 1;
    console.log(`Zustand: Incrementing regeneration count to ${newCount}`);
    set({ regenerationCount: newCount });
  },
  
  resetWorkflow: () => {
    console.log('Zustand: Resetting workflow to initial state');
    set({
      currentStep: 0,
      isRunning: false,
      progress: 0,
      currentSubStep: 0,
      showInitialThinking: false,
      intentClassified: false,
      extractedInfo: {},
      showFeedback: false,
      feedbackGiven: null,
      sampleQuestions: [],
      isRegenerating: false,
      regenerationCount: 0,
      schedulerOpen: false,
      selectedDate: '',
      steps: initialSteps.map(step => ({ ...step, status: 'pending' as const }))
    });
  },
})); 