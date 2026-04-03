import { ProviderConfig, Template } from './types';

export const TEMPLATES: Template[] = [
  { title: 'Midjourney 摄影 (写实)', content: 'A high quality photo of a cyberpunk city, neon lights, rainy night, 8k resolution, photorealistic, cinematic lighting, highly detailed --ar 16:9 --v 6.0' },
  { title: 'Midjourney 动漫 (Niji)', content: 'A beautiful anime girl, detailed eyes, flowing hair, standing in a magical forest, glowing butterflies, studio ghibli style, vibrant colors --ar 3:4 --niji 6' },
  { title: '代码审查 (Code Review)', content: 'Please review the following code for security vulnerabilities, performance issues, and best practices. Provide specific recommendations for improvement, and rewrite the code if necessary.' },
  { title: '前端专家模拟', content: 'I want you to act as a senior frontend developer. I will ask you questions about React, TypeScript, and modern web development. You will answer them with detailed explanations, best practices, and code examples.' },
  { title: '文章润色 (Polishing)', content: 'Please proofread and polish the following text. Improve the vocabulary, fix grammar issues, enhance the flow, and make it sound more professional and native.' },
  { title: '小红书爆款文案', content: '请作为小红书爆款文案写手，根据我提供的主题，写一篇吸引眼球的笔记。要求：标题带有吸引力（使用Emoji），正文结构清晰，包含痛点、解决方案和互动引导，最后加上相关的热门标签。' },
  { title: '正则表达式生成器', content: 'I want you to act as a regex generator. Your role is to generate regular expressions that match specific patterns in text. You should provide the regular expressions in a format that can be easily copied and pasted, along with a brief explanation of how it works.' },
  { title: '面试官模拟', content: 'I want you to act as an interviewer. I will be the candidate and you will ask me the interview questions for the position I specify. I want you to only reply as the interviewer. Do not write all the conservation at once. Ask me the questions one by one and wait for my answers.' },
  { title: 'SQL 专家', content: 'I want you to act as a SQL expert. I will provide you with a database schema and a specific data retrieval request, and you will write the most efficient SQL query to get the desired results. Please explain the logic behind your query.' },
  { title: '高级翻译专家', content: 'I want you to act as an English translator, spelling corrector and improver. I will speak to you in any language and you will detect the language, translate it and answer in the corrected and improved version of my text, in English. Replace my simplified words with more beautiful and elegant, upper-level English words. Keep the meaning same, but make them more literary.' },
  { title: '简历优化 (Resume)', content: 'I want you to act as a resume optimizer. I will provide you with my current resume and a job description I am applying for. You will analyze both and suggest specific improvements to my resume to make it more tailored to the job, highlighting relevant skills and experiences.' },
  { title: 'UI/UX 设计师', content: 'I want you to act as a UX/UI designer. I will provide some details about the design of an app or website, and it will be your job to come up with creative ways to improve its user experience. This could involve suggesting layout changes, color palettes, typography, and interaction patterns.' },
  { title: '数据分析师', content: 'I want you to act as a data analyst. I will provide you with a description of data or a specific business problem, and you will help me analyze it, identify trends, and draw meaningful conclusions. Suggest appropriate visualizations and metrics to track.' },
  { title: 'Linux 终端模拟', content: 'I want you to act as a linux terminal. I will type commands and you will reply with what the terminal should show. I want you to only reply with the terminal output inside one unique code block, and nothing else. do not write explanations. do not type commands unless I instruct you to do so.' },
  { title: '英语口语老师', content: 'I want you to act as a spoken English teacher and improver. I will speak to you in English and you will reply to me in English to practice my spoken English. I want you to keep your reply neat, limiting the reply to 100 words. I want you to strictly correct my grammar mistakes, typos, and factual errors. I want you to ask me a question in your reply.' },
  { title: '系统架构师', content: 'I want you to act as a software architect. I will provide some details about the functionality of an application, and you will design the system architecture. You should choose the appropriate tech stack, database, and cloud services, and explain the reasoning behind your choices.' }
];

export const PROVIDERS: ProviderConfig[] = [
  {
    id: 'offline',
    name: '离线翻译 (本地模型)',
    models: [{ id: 'xenova/opus-mt', name: 'Opus-MT (无需联网)' }],
    envKey: ''
  },
  {
    id: 'gemini',
    name: 'Google Gemini',
    models: [{ id: 'gemini-3-flash-preview', name: 'Gemini 3 Flash' }],
    envKey: 'GEMINI_API_KEY'
  },
  {
    id: 'ark',
    name: '火山方舟 (Ark)',
    models: [
      { id: 'deepseek-v3-250324', name: 'DeepSeek V3' },
      { id: 'deepseek-r1-250528', name: 'DeepSeek R1' }
    ],
    endpoint: 'https://ark.cn-beijing.volces.com/api/v3/chat/completions',
    envKey: 'ARK_API_KEY'
  },
  {
    id: 'qwen',
    name: '阿里云百炼 (Qwen)',
    models: [{ id: 'qwen-plus', name: '通义千问 Plus' }],
    endpoint: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
    envKey: 'QWEN_API_KEY'
  },
  {
    id: 'nvidia',
    name: 'NVIDIA',
    models: [
      { id: 'deepseek-ai/deepseek-v3.1', name: 'DeepSeek v3.1' },
      { id: 'deepseek-ai/deepseek-v3.2', name: 'DeepSeek v3.2' }
    ],
    endpoint: 'https://integrate.api.nvidia.com/v1/chat/completions',
    envKey: 'NVIDIA_API_KEY'
  },
  {
    id: 'kilo',
    name: 'Kilo Code',
    models: [
      { id: 'kilo-auto/free', name: 'Kilo Auto (免费)' },
      { id: 'minimax/minimax-m2.5:free', name: 'MiniMax M2.5 (免费)' }
    ],
    endpoint: 'https://api.kilo.ai/api/gateway/chat/completions',
    envKey: 'KILO_API_KEY'
  }
];
