import { PenTool, Code, Brain, Calendar, MessageSquare, Sparkles } from 'lucide-react';
import type { ExampleItem } from '../context/PromptContext.d';

export const examples: ExampleItem[] = [
  {
    title: "Blog Post Outline",
    input: "write a blog post about AI workflows",
    output: "You are an expert content strategist. Create a structured blog post outline about AI workflows for operators and product teams. Include a clear thesis, section-by-section headings, practical examples, risks to avoid, and a closing checklist. Keep the tone professional, avoid hype, and make each section actionable for a reader who wants to improve an existing workflow.",
    icon: PenTool,
    tone: 'professional',
    length: 'medium'
  },
  {
    title: "App Development",
    input: "build a task management app",
    output: "You are a senior product engineer. Draft a technical implementation plan for a task management app. Cover the core user flows, data model, component architecture, API boundaries, accessibility requirements, offline or sync considerations, and a staged build plan. Call out tradeoffs and risks before recommending the first milestone.",
    icon: Code,
    tone: 'technical',
    length: 'comprehensive'
  },
  {
    title: "AI Integration",
    input: "integrate AI chatbot into website",
    output: "You are an AI product architect. Create an integration brief for adding an AI assistant to a website. Include target user jobs, safe fallback behavior, model and retrieval requirements, privacy constraints, UI states, analytics events, and launch criteria. Explain how the assistant should earn user trust without interrupting the main site experience.",
    icon: Brain,
    tone: 'professional',
    length: 'comprehensive'
  },
  {
    title: "Business Strategy",
    input: "create a business plan for a startup",
    output: "You are a startup strategy advisor. Create a concise business plan for an early-stage SaaS product. Include the customer segment, problem statement, differentiated offer, pricing hypothesis, go-to-market plan, operating assumptions, risks, validation experiments, and the next 30-day action plan. Keep the plan realistic and investor-ready.",
    icon: Calendar,
    tone: 'professional',
    length: 'comprehensive'
  },
  {
    title: "Content Marketing",
    input: "develop a content marketing strategy",
    output: "You are a B2B content lead. Build a content marketing strategy with audience segments, narrative pillars, channel priorities, publishing cadence, repurposing plan, lead magnets, success metrics, and a 90-day execution calendar. Include examples of strong post angles and clear criteria for what not to publish.",
    icon: MessageSquare,
    tone: 'professional',
    length: 'comprehensive'
  },
  {
    title: "Creative Writing",
    input: "write a short story about time travel",
    output: "You are a fiction editor and speculative storyteller. Write a short story about time travel with a clear emotional premise, one central paradox, vivid sensory details, and a satisfying final turn. Keep the timeline internally consistent, avoid exposition dumps, and make the ending feel inevitable in hindsight.",
    icon: Sparkles,
    tone: 'creative',
    length: 'medium'
  }
];
