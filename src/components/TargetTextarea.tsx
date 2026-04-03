import React, { RefObject } from 'react';
import { Copy, Check, Loader2, Database } from 'lucide-react';
import { Direction } from '../types';

interface TargetTextareaProps {
  targetRef: RefObject<HTMLTextAreaElement>;
  targetText: string;
  handleScroll: (e: React.UIEvent<HTMLTextAreaElement>, type: 'source' | 'target') => void;
  handleCopy: () => void;
  isTranslating: boolean;
  loadingMessage: string;
  direction: Direction;
  isCopied: boolean;
  handleSavePrompt: () => void;
  isSaving: boolean;
}

export function TargetTextarea({
  targetRef,
  targetText,
  handleScroll,
  handleCopy,
  isTranslating,
  loadingMessage,
  direction,
  isCopied,
  handleSavePrompt,
  isSaving
}: TargetTextareaProps) {
  return (
    <div className="flex flex-col bg-neutral-50 dark:bg-neutral-800/50 rounded-2xl border border-neutral-200/60 dark:border-neutral-700 overflow-hidden relative">
      <div className="px-4 py-3 border-b border-neutral-200/60 dark:border-neutral-700 bg-neutral-100/50 dark:bg-neutral-800 flex justify-between items-center">
        <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
          {direction === 'zh-to-en' ? '英文' : '中文'}
        </span>
        <span className="text-xs font-medium text-neutral-400 dark:text-neutral-500">
          {targetText.length}
        </span>
      </div>
      
      <div className="flex-1 relative">
        {isTranslating && (
          <div className="absolute inset-0 bg-neutral-50/80 dark:bg-neutral-900/80 backdrop-blur-sm flex items-center justify-center z-10">
            <div className="flex flex-col items-center gap-3 text-blue-600 dark:text-blue-400">
              <Loader2 className="w-8 h-8 animate-spin" />
              <span className="text-sm font-medium animate-pulse">{loadingMessage}</span>
            </div>
          </div>
        )}
        <textarea
          ref={targetRef}
          value={targetText}
          readOnly
          onScroll={(e) => handleScroll(e, 'target')}
          placeholder="翻译结果将显示在这里..."
          className="w-full h-full p-4 min-h-[200px] md:min-h-[250px] resize-y outline-none bg-transparent text-neutral-800 dark:text-neutral-200 placeholder:text-neutral-400 dark:placeholder:text-neutral-600 text-base leading-relaxed"
        />
      </div>

      <div className="p-3 border-t border-neutral-200/60 dark:border-neutral-700 bg-neutral-100/30 dark:bg-neutral-800/30 flex flex-col gap-2">
        <button
          onClick={handleCopy}
          disabled={!targetText}
          className="flex w-full justify-center items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 dark:disabled:bg-blue-800 text-white font-medium rounded-xl shadow-sm"
        >
          {isCopied ? (
            <>
              <Check className="w-4 h-4 text-green-600" />
              <span className="text-green-600">已复制！</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              复制提示词
            </>
          )}
        </button>
        <button
          onClick={handleSavePrompt}
          disabled={!targetText || isSaving}
          className="flex w-full justify-center items-center gap-2 px-5 py-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 disabled:opacity-50 disabled:hover:bg-blue-50 text-blue-700 font-medium rounded-xl shadow-sm"
        >
          <Database className="w-4 h-4" />
          保存提示词
        </button>
      </div>
    </div>
  );
}
