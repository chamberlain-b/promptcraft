import { PenTool, Code, Brain, Calendar, MessageSquare, Sparkles } from 'lucide-react';
import type { ExampleItem } from '../context/PromptContext';

export const examples: ExampleItem[] = [
  {
    title: "Content Writing",
    input: "write a blog post about AI",
    output: "You are an expert content writer and technology journalist with deep knowledge of artificial intelligence. Write a comprehensive, engaging blog post about AI that covers current trends, applications, and future implications. The post should be 800-1200 words, include relevant examples and case studies, use clear headings and subheadings, maintain a professional yet accessible tone, and provide actionable insights for readers. Include an engaging introduction, well-structured body with supporting evidence, and a compelling conclusion that encourages further engagement with the topic.",
    icon: PenTool,
    tone: 'professional',
    length: 'long'
  },
  {
    title: "App Development",
    input: "build a task management app",
    output: "You are a senior software engineer and technical mentor with extensive experience in Python development. Create a comprehensive Python function to sort a list that demonstrates best practices and includes multiple sorting options. The function should handle different data types, include comprehensive error handling, provide detailed comments explaining the logic, and include usage examples with different scenarios. Consider edge cases like empty lists, mixed data types, and performance optimization. Provide both the function implementation and clear documentation on how to use it effectively.",
    icon: Code,
    tone: 'technical',
    length: 'comprehensive'
  },
  {
    title: "AI Integration",
    input: "integrate AI chatbot into website",
    output: "You are a data analyst and research specialist with expertise in sales analytics and business intelligence. Conduct a comprehensive analysis of sales data trends that provides actionable insights for business decision-making. Your analysis should include trend identification, seasonal patterns, performance metrics, comparative analysis, and predictive insights. Use clear visualizations where appropriate, provide statistical context, identify key drivers of sales performance, and offer specific recommendations for improvement. Structure your response with clear sections for findings, insights, and actionable next steps.",
    icon: Brain,
    tone: 'professional',
    length: 'comprehensive'
  },
  {
    title: "Business Strategy",
    input: "create a business plan for a startup",
    output: "You are a nutritionist and meal planning expert with knowledge of dietary science and culinary arts. Create a comprehensive weekly meal plan that prioritizes nutrition, variety, and practicality. The plan should include balanced macronutrients, diverse food groups, seasonal ingredients, and accommodate common dietary preferences. Provide detailed recipes with nutritional information, shopping lists organized by category, preparation time estimates, and storage recommendations. Consider budget constraints, cooking skill levels, and time availability. Include options for meal prep and leftovers to maximize efficiency.",
    icon: Calendar,
    tone: 'friendly',
    length: 'comprehensive'
  },
  {
    title: "Content Marketing",
    input: "develop a content marketing strategy",
    output: "You are a productivity consultant and project manager with expertise in marketing strategy and campaign execution. Develop a comprehensive marketing campaign plan that includes clear objectives, target audience analysis, channel strategy, timeline, budget allocation, and success metrics. The plan should be actionable with specific tasks, deadlines, and responsibilities. Include risk assessment, contingency plans, and performance tracking methods. Provide templates for key deliverables, communication protocols, and evaluation criteria. Structure the response with clear phases, milestones, and measurable outcomes.",
    icon: MessageSquare,
    tone: 'professional',
    length: 'comprehensive'
  },
  {
    title: "Creative Writing",
    input: "write a short story about time travel",
    output: "You are a creative professional and storytelling expert with deep understanding of narrative structure and science fiction elements. Write an engaging short story about time travel that explores the complexities of temporal paradoxes, human nature, and the consequences of changing the past. The story should be 1500-2000 words, feature well-developed characters, include vivid descriptions, maintain consistent internal logic, and deliver a satisfying emotional arc. Use creative narrative techniques, build tension effectively, and provide a thought-provoking conclusion that resonates with readers.",
    icon: Sparkles,
    tone: 'creative',
    length: 'long'
  }
];
