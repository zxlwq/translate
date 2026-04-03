import React, { useState, useRef, useEffect } from 'react';
import { ArrowRightLeft, Copy, Check, Sparkles, Loader2, Languages, Cpu, SlidersHorizontal, FileText, Database, CheckCircle2, XCircle, Lock, X, Wand2, Trash2, LayoutTemplate, Search, Link, Unlink, Moon, Sun, Trash } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Direction, ProviderId, TranslateMode, SavedPrompt } from './types';
import { TEMPLATES, PROVIDERS } from './constants';
import { TemplateModal } from './components/TemplateModal';
import { Header } from './components/Header';
import { Controls } from './components/Controls';
import { SourceTextarea } from './components/SourceTextarea';
import { TargetTextarea } from './components/TargetTextarea';

export default function App() {
  const [sourceText, setSourceText] = useState('');
  const [targetText, setTargetText] = useState('');
  const [direction, setDirection] = useState<Direction>('en-to-zh');
  const [isTranslating, setIsTranslating] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [error, setError] = useState('');
  
  // D1 Database State
  const [toast, setToast] = useState<{show: boolean, type: 'loading'|'success'|'error', text: string} | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [isAuth, setIsAuth] = useState(false);
  const [savedPrompts, setSavedPrompts] = useState<SavedPrompt[]>([]);
  const [isLoadingPrompts, setIsLoadingPrompts] = useState(false);

  const showToastMsg = (type: 'loading'|'success'|'error', text: string, duration = 3000) => {
    setToast({ show: true, type, text });
    if (type !== 'loading') {
      setTimeout(() => setToast(null), duration);
    }
  };

  const handleSavePrompt = async () => {
    if (!targetText) return;
    setIsSaving(true);
    showToastMsg('loading', '正在保存到D1数据库...');
    try {
      const res = await fetch('/api/prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source_text: sourceText,
          target_text: targetText,
          model: selectedModel,
          provider: selectedProvider
        })
      });
      if (!res.ok) throw new Error('保存失败');
      showToastMsg('success', '保存成功！');
    } catch (err) {
      showToastMsg('error', '保存失败，请检查网络或配置');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogin = async () => {
    setIsLoadingPrompts(true);
    try {
      const res = await fetch(`/api/prompts?password=${encodeURIComponent(adminPassword)}`);
      if (res.status === 401) {
        showToastMsg('error', '密码错误');
        setIsLoadingPrompts(false);
        return;
      }
      if (!res.ok) throw new Error('获取失败');
      const data = await res.json();
      setSavedPrompts(data);
      setIsAuth(true);
    } catch (err) {
      showToastMsg('error', '获取数据失败');
    } finally {
      setIsLoadingPrompts(false);
    }
  };

  const handleCopySaved = async (text: string) => {
    await navigator.clipboard.writeText(text);
    showToastMsg('success', '已复制！', 2000);
  };

  const [selectedProvider, setSelectedProvider] = useState<ProviderId>('gemini');
  const [selectedModel, setSelectedModel] = useState<string>('gemini-3-flash-preview');
  const [translateMode, setTranslateMode] = useState<TranslateMode>('all');
  const [isOptimizeEnabled, setIsOptimizeEnabled] = useState(false);

  // New Features State
  const [isSyncScroll, setIsSyncScroll] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const sourceRef = useRef<HTMLTextAreaElement>(null);
  const targetRef = useRef<HTMLTextAreaElement>(null);
  const isScrolling = useRef<'source' | 'target' | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('翻译中...');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const workerRef = useRef<Worker | null>(null);

  // Load from LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem('prompt_translator_state');
    if (saved) {
      try {
        const state = JSON.parse(saved);
        if (state.sourceText) setSourceText(state.sourceText);
        if (state.targetText) setTargetText(state.targetText);
        if (state.direction) setDirection(state.direction);
        if (state.selectedProvider) setSelectedProvider(state.selectedProvider);
        if (state.selectedModel) setSelectedModel(state.selectedModel);
        if (state.translateMode) setTranslateMode(state.translateMode);
        if (state.isOptimizeEnabled !== undefined) setIsOptimizeEnabled(state.isOptimizeEnabled);
        if (state.isDarkMode !== undefined) setIsDarkMode(state.isDarkMode);
      } catch (e) {}
    }
    setIsLoaded(true);

    // Initialize Web Worker
    workerRef.current = new Worker(new URL('./translation.ts', import.meta.url), {
      type: 'module'
    });

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
      }
    };
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Save to LocalStorage
  useEffect(() => {
    if (!isLoaded) return;
    const state = { sourceText, targetText, direction, selectedProvider, selectedModel, translateMode, isOptimizeEnabled, isDarkMode };
    localStorage.setItem('prompt_translator_state', JSON.stringify(state));
  }, [sourceText, targetText, direction, selectedProvider, selectedModel, translateMode, isOptimizeEnabled, isDarkMode, isLoaded]);

  const handleFreeMemory = () => {
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = new Worker(new URL('./translation.ts', import.meta.url), {
        type: 'module'
      });
      showToastMsg('success', '已释放离线模型内存');
    }
  };

  const handleTranslate = async () => {
    if (!sourceText.trim()) return;
    
    setError('');
    setIsTranslating(true);
    setTargetText('');
    
    const providerConfig = PROVIDERS.find(p => p.id === selectedProvider);
    if (!providerConfig) {
      setError('选择的提供商无效。');
      setIsTranslating(false);
      return;
    }

    const targetLang = direction === 'zh-to-en' ? 'English' : 'Chinese';
    let systemInstruction = '';
    
    const preserveKeysInstruction = `\n- CRITICAL: The user's text may contain key-value pairs, JSON, YAML, markdown headers, or XML tags. You MUST ONLY translate (and optimize if requested) the values/content. DO NOT translate or modify the keys, property names, tags, or structural elements. Keep them exactly as they appear in the original text.`;

    if (isOptimizeEnabled) {
      systemInstruction = `You are an expert prompt engineer and translator. Translate the user's text into ${targetLang} AND optimize it to be a highly effective prompt for AI models.
- Clarify ambiguous parts, add necessary context, and improve the overall structure.
- Use clear formatting (like markdown) if it helps the AI understand better.
- Return ONLY the final translated and optimized prompt. Do not add any conversational filler, explanations, or markdown code blocks unless necessary for the prompt itself.`;
      if (translateMode === 'values-only') {
        systemInstruction += preserveKeysInstruction;
      }
    } else {
      systemInstruction = `You are a strict translator. Translate the user's text into ${targetLang}. 
- Perform a direct and faithful translation.
- DO NOT optimize, modify, or enhance the prompt in any way.
- Maintain the exact original intent, tone, formatting, and structure.
- Return ONLY the translated text. Do not add any conversational filler, explanations, or markdown code blocks unless they were in the original text.`;
      if (translateMode === 'values-only') {
        systemInstruction += preserveKeysInstruction;
      }
    }

    try {
      setLoadingMessage('翻译中...');
      if (selectedProvider === 'offline') {
        if (!workerRef.current) {
          throw new Error('离线翻译模块未初始化');
        }

        const translationId = Date.now().toString();
        
        const workerPromise = new Promise<string>((resolve, reject) => {
          const messageHandler = (event: MessageEvent) => {
            const data = event.data;
            if (data.status === 'loading') {
              setLoadingMessage(data.message);
            } else if (data.status === 'complete' && data.id === translationId) {
              workerRef.current?.removeEventListener('message', messageHandler);
              resolve(data.result);
            } else if (data.status === 'error' && data.id === translationId) {
              workerRef.current?.removeEventListener('message', messageHandler);
              reject(new Error(data.error));
            }
          };
          
          workerRef.current?.addEventListener('message', messageHandler);
          workerRef.current?.postMessage({
            text: sourceText,
            direction,
            id: translationId
          });
        });

        const result = await workerPromise;
        setTargetText(result);
      } else {
        const response = await fetch('/api/ai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            provider: selectedProvider,
            model: selectedModel,
            sourceText,
            systemInstruction,
            stream: true
          })
        });

        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.error || `HTTP 错误 ${response.status}`);
        }

        if (!response.body) throw new Error('ReadableStream not supported.');

        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let done = false;
        let accumulatedText = '';
        let hasStartedStreaming = false;

        while (!done) {
          const { value, done: readerDone } = await reader.read();
          done = readerDone;
          if (value) {
            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n');
            for (const line of lines) {
              if (line.startsWith('data: ') && line !== 'data: [DONE]') {
                try {
                  const data = JSON.parse(line.slice(6));
                  let textChunk = '';
                  if (selectedProvider === 'gemini') {
                    textChunk = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
                  } else {
                    textChunk = data.choices?.[0]?.delta?.content || '';
                  }
                  if (textChunk) {
                    // 第一次收到数据块时隐藏加载提示
                    if (!hasStartedStreaming) {
                      setIsTranslating(false);
                      hasStartedStreaming = true;
                    }
                    accumulatedText += textChunk;
                    setTargetText(accumulatedText);
                  }
                } catch (e) {
                  // Ignore parsing errors for incomplete chunks
                }
              }
            }
          }
        }
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || '翻译过程中发生错误。');
    } finally {
      setIsTranslating(false);
    }
  };

  const handleCopy = async () => {
    if (!targetText) return;
    try {
      await navigator.clipboard.writeText(targetText);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('复制失败', err);
    }
  };

  const toggleDirection = () => {
    setDirection(prev => prev === 'zh-to-en' ? 'en-to-zh' : 'zh-to-en');
    if (sourceText && targetText) {
      setSourceText(targetText);
      setTargetText(sourceText);
    }
  };

  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const [providerId, modelId] = e.target.value.split(':');
    setSelectedProvider(providerId as ProviderId);
    setSelectedModel(modelId);
  };

  const handleDeletePrompt = async (id: number) => {
    if (!window.confirm('确定要删除这条记录吗？')) return;
    try {
      const res = await fetch(`/api/prompts?id=${id}&password=${encodeURIComponent(adminPassword)}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('删除失败');
      setSavedPrompts(prev => prev.filter(p => p.id !== id));
      showToastMsg('success', '删除成功');
    } catch (err) {
      showToastMsg('error', '删除失败');
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>, type: 'source' | 'target') => {
    if (!isSyncScroll) return;
    if (isScrolling.current && isScrolling.current !== type) return;
    
    isScrolling.current = type;
    const current = e.currentTarget;
    const target = type === 'source' ? targetRef.current : sourceRef.current;
    
    if (target) {
      const percentage = current.scrollTop / (current.scrollHeight - current.clientHeight || 1);
      target.scrollTop = percentage * (target.scrollHeight - target.clientHeight);
    }
    
    setTimeout(() => { isScrolling.current = null; }, 50);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      handleTranslate();
    }
  };

  const handleClear = () => {
    setSourceText('');
    setTargetText('');
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 font-sans selection:bg-blue-200 dark:selection:bg-blue-900 transition-colors">
      <Header
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        handleFreeMemory={handleFreeMemory}
        setShowTemplates={setShowTemplates}
        setShowAdmin={setShowAdmin}
      />

      {/* Main Content */}
      <main className="w-full px-4 md:px-8 py-6">
        <div className="flex flex-col gap-6">
          
          <Controls
            direction={direction}
            toggleDirection={toggleDirection}
            isOptimizeEnabled={isOptimizeEnabled}
            setIsOptimizeEnabled={setIsOptimizeEnabled}
            isSyncScroll={isSyncScroll}
            setIsSyncScroll={setIsSyncScroll}
            translateMode={translateMode}
            setTranslateMode={setTranslateMode}
            selectedProvider={selectedProvider}
            selectedModel={selectedModel}
            handleModelChange={handleModelChange}
          />

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100 flex items-start gap-3">
              <div className="mt-0.5">⚠️</div>
              <div>{error}</div>
            </div>
          )}

          {/* Translation Areas */}
          <div className="flex flex-col gap-4 md:gap-6">
            
            <SourceTextarea
              sourceRef={sourceRef}
              sourceText={sourceText}
              setSourceText={setSourceText}
              handleKeyDown={handleKeyDown}
              handleScroll={handleScroll}
              handleTranslate={handleTranslate}
              handleClear={handleClear}
              isTranslating={isTranslating}
              direction={direction}
              targetText={targetText}
            />

            <TargetTextarea
              targetRef={targetRef}
              targetText={targetText}
              handleScroll={handleScroll}
              handleCopy={handleCopy}
              isTranslating={isTranslating}
              loadingMessage={loadingMessage}
              direction={direction}
              isCopied={isCopied}
              handleSavePrompt={handleSavePrompt}
              isSaving={isSaving}
            />

          </div>
        </div>
      </main>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 50, x: '-50%' }}
            className="fixed bottom-8 left-1/2 z-[60] flex items-center gap-3 px-5 py-3.5 bg-neutral-900/95 backdrop-blur-md text-white rounded-2xl shadow-2xl border border-neutral-800"
          >
            {toast.type === 'loading' && <Loader2 className="w-5 h-5 animate-spin text-blue-400" />}
            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-green-400" />}
            {toast.type === 'error' && <XCircle className="w-5 h-5 text-red-400" />}
            <span className="font-medium text-sm tracking-wide">{toast.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Admin Modal */}
      <AnimatePresence>
        {showAdmin && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAdmin(false)}
              className="absolute inset-0 bg-neutral-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[85vh] flex flex-col relative z-10 overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between shrink-0">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Database className="w-5 h-5 text-blue-600" />
                  D1 数据库已保存记录
                </h2>
                <div className="flex items-center gap-3">
                  {isAuth && (
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                      <input 
                        type="text" 
                        placeholder="搜索记录..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 pr-4 py-1.5 bg-neutral-100 border-none rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 outline-none w-48"
                      />
                    </div>
                  )}
                  <button
                    onClick={() => setShowAdmin(false)}
                    className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              <div className="p-6 overflow-y-auto flex-1 bg-neutral-50/50">
                {!isAuth ? (
                  <div className="max-w-sm mx-auto mt-10 bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
                    <div className="flex justify-center mb-4">
                      <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
                        <Lock className="w-6 h-6" />
                      </div>
                    </div>
                    <h3 className="text-center font-medium text-lg mb-6">请输入管理员密码</h3>
                    <input
                      type="password"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                      placeholder="输入密码"
                      className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all mb-4 text-center"
                    />
                    <button
                      onClick={handleLogin}
                      disabled={isLoadingPrompts || !adminPassword}
                      className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium rounded-xl transition-colors flex justify-center items-center gap-2"
                    >
                      {isLoadingPrompts ? <Loader2 className="w-5 h-5 animate-spin" /> : '验证并查看'}
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    {savedPrompts.filter(p => 
                      p.source_text.toLowerCase().includes(searchQuery.toLowerCase()) || 
                      p.target_text.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      p.model.toLowerCase().includes(searchQuery.toLowerCase())
                    ).length === 0 ? (
                      <div className="text-center py-12 text-neutral-400">
                        <Database className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p>暂无保存的提示词记录</p>
                      </div>
                    ) : (
                      savedPrompts.filter(p => 
                        p.source_text.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        p.target_text.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        p.model.toLowerCase().includes(searchQuery.toLowerCase())
                      ).map((prompt) => (
                        <div key={prompt.id} className="bg-white p-4 rounded-xl border border-neutral-200 shadow-sm flex flex-col gap-3">
                          <div className="flex justify-between items-center text-xs text-neutral-400 border-b border-neutral-100 pb-2">
                            <span className="flex items-center gap-1">
                              <Cpu className="w-3 h-3" />
                              {prompt.provider} / {prompt.model}
                            </span>
                            <span>{new Date(prompt.created_at).toLocaleString()}</span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <div className="text-xs font-medium text-neutral-500 mb-1">原文</div>
                              <div className="text-sm text-neutral-700 bg-neutral-50 p-3 rounded-lg max-h-32 overflow-y-auto">
                                {prompt.source_text}
                              </div>
                            </div>
                            <div>
                              <div className="text-xs font-medium text-neutral-500 mb-1">译文</div>
                              <div className="text-sm text-neutral-700 bg-neutral-50 p-3 rounded-lg max-h-32 overflow-y-auto">
                                {prompt.target_text}
                              </div>
                            </div>
                          </div>
                          <div className="flex justify-end pt-2 gap-2">
                            <button
                              onClick={() => handleDeletePrompt(prompt.id)}
                              className="flex items-center gap-1.5 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-medium rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                              删除
                            </button>
                            <button
                              onClick={() => handleCopySaved(prompt.target_text)}
                              className="flex items-center gap-1.5 px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-sm font-medium rounded-lg transition-colors"
                            >
                              <Copy className="w-4 h-4" />
                              复制译文
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Templates Modal */}
      <TemplateModal
        isOpen={showTemplates}
        onClose={() => setShowTemplates(false)}
        templates={TEMPLATES}
        onSelect={(content) => {
          setSourceText(content);
        }}
      />
    </div>
  );
}
