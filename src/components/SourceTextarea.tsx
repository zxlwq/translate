import React, { RefObject } from 'react';
import { Sparkles, Trash2, Loader2 } from 'lucide-react';
import { Direction } from '../types';

interface SourceTextareaProps {
  sourceRef: RefObject<HTMLTextAreaElement>;
  sourceText: string;
  setSourceText: (value: string) => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  handleScroll: (e: React.UIEvent<HTMLTextAreaElement>, type: 'source' | 'target') => void;
  handleTranslate: () => void;
  handleClear: () => void;
  isTranslating: boolean;
  direction: Direction;
  targetText: string;
}

export function SourceTextarea({
  sourceRef,
  sourceText,
  setSourceText,
  handleKeyDown,
  handleScroll,
  handleTranslate,
  handleClear,
  isTranslating,
  direction,
  targetText
}: SourceTextareaProps) {
  return (
    <div className="flex flex-col bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-neutral-200/60 dark:border-neutral-700 overflow-hidden focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all">
      <div className="px-4 py-3 border-b border-neutral-100 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800/50 flex justify-between items-center">
        <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
          {direction === 'zh-to-en' ? '中文' : '英文'}
        </span>
        <span className="text-xs font-medium text-neutral-400 dark:text-neutral-500">
          {sourceText.length}
        </span>
      </div>
      <textarea
        ref={sourceRef}
        value={sourceText}
        onChange={(e) => setSourceText(e.target.value)}
        onKeyDown={handleKeyDown}
        onScroll={(e) => handleScroll(e, 'source')}
        placeholder="在此输入您的提示词... (Ctrl + Enter 翻译)"
        className="flex-1 w-full p-4 min-h-[200px] md:min-h-[250px] resize-y outline-none bg-transparent text-neutral-800 dark:text-neutral-200 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 text-base leading-relaxed"
        spellCheck="false"
      />
      <div className="p-3 border-t border-neutral-100 dark:border-neutral-700 bg-white dark:bg-neutral-800 flex flex-col gap-2">
        <button
          onClick={handleTranslate}
          disabled={!sourceText.trim() || isTranslating}
          className="flex w-full justify-center items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 dark:disabled:bg-blue-800 text-white font-medium rounded-xl shadow-sm"
        >
          {isTranslating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              翻译中...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              翻译
            </>
          )}
        </button>
        <button
          onClick={handleClear}
          disabled={!sourceText && !targetText}
          className="flex w-full justify-center items-center gap-2 px-5 py-3 bg-white hover:bg-red-50 border border-neutral-200 hover:border-red-200 disabled:opacity-50 disabled:hover:bg-white disabled:hover:border-neutral-200 text-neutral-700 hover:text-red-600 font-medium rounded-xl shadow-sm"
        >
          <Trash2 className="w-4 h-4" />
          清空内容
        </button>
      </div>
    </div>
  );
}
