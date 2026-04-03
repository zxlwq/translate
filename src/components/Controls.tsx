import React from 'react';
import { Languages, ArrowRightLeft, Wand2, Link, Unlink, SlidersHorizontal, Cpu } from 'lucide-react';
import { Direction, TranslateMode } from '../types';
import { PROVIDERS } from '../constants';

interface ControlsProps {
  direction: Direction;
  toggleDirection: () => void;
  isOptimizeEnabled: boolean;
  setIsOptimizeEnabled: (value: boolean) => void;
  isSyncScroll: boolean;
  setIsSyncScroll: (value: boolean) => void;
  translateMode: TranslateMode;
  setTranslateMode: (value: TranslateMode) => void;
  selectedProvider: string;
  selectedModel: string;
  handleModelChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

export function Controls({
  direction,
  toggleDirection,
  isOptimizeEnabled,
  setIsOptimizeEnabled,
  isSyncScroll,
  setIsSyncScroll,
  translateMode,
  setTranslateMode,
  selectedProvider,
  selectedModel,
  handleModelChange
}: ControlsProps) {
  return (
    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between bg-white dark:bg-neutral-900 p-2 rounded-2xl shadow-sm border border-neutral-200/60 dark:border-neutral-800 gap-4 lg:gap-0 transition-colors">
      
      <div className="flex items-center gap-2 px-2 sm:px-4 py-2 w-full lg:w-auto">
        <Languages className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
        <span className="font-medium text-neutral-700 dark:text-neutral-200 whitespace-nowrap">
          {direction === 'zh-to-en' ? '中文译英文' : '英文译中文'}
        </span>
        <button
          onClick={toggleDirection}
          className="ml-2 flex items-center justify-center w-8 h-8 bg-neutral-100 dark:bg-neutral-800 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 text-neutral-600 dark:text-neutral-400 rounded-lg transition-all active:scale-95"
          title="切换语言"
        >
          <ArrowRightLeft className="w-4 h-4" />
        </button>
      </div>
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 px-2 sm:px-4 w-full lg:w-auto border-t lg:border-t-0 lg:border-l border-neutral-100 dark:border-neutral-800 pt-3 lg:pt-0 flex-wrap">
        
        {/* AI Optimize Toggle */}
        <label className="flex items-center gap-2 cursor-pointer w-full sm:w-auto hover:bg-neutral-50 dark:hover:bg-neutral-800/50 p-1.5 rounded-lg transition-colors">
          <Wand2 className={`w-5 h-5 shrink-0 transition-colors ${isOptimizeEnabled ? 'text-purple-600 dark:text-purple-400' : 'text-neutral-400 dark:text-neutral-500'}`} />
          <div className="relative flex items-center">
            <input 
              type="checkbox" 
              className="sr-only" 
              checked={isOptimizeEnabled} 
              onChange={(e) => setIsOptimizeEnabled(e.target.checked)} 
            />
            <div className={`block w-9 h-5 rounded-full transition-colors ${isOptimizeEnabled ? 'bg-purple-600 dark:bg-purple-500' : 'bg-neutral-300 dark:bg-neutral-700'}`}></div>
            <div className={`absolute left-0.5 top-0.5 bg-white dark:bg-neutral-200 w-4 h-4 rounded-full transition-transform ${isOptimizeEnabled ? 'transform translate-x-4' : ''}`}></div>
          </div>
          <span className={`text-sm font-medium transition-colors ${isOptimizeEnabled ? 'text-purple-700 dark:text-purple-400' : 'text-neutral-600 dark:text-neutral-400'}`}>
            AI提示词优化
          </span>
        </label>

        <div className="hidden sm:block w-px h-6 bg-neutral-200 dark:bg-neutral-800 mx-1"></div>

        {/* Sync Scroll Toggle */}
        <button
          onClick={() => setIsSyncScroll(!isSyncScroll)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors text-sm font-medium ${isSyncScroll ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400' : 'hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400'}`}
          title="双向同步滚动"
        >
          {isSyncScroll ? <Link className="w-4 h-4" /> : <Unlink className="w-4 h-4" />}
          <span className="hidden md:inline">同步滚动</span>
        </button>

        <div className="hidden sm:block w-px h-6 bg-neutral-200 dark:bg-neutral-800 mx-1"></div>

        {/* Translation Mode */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <SlidersHorizontal className="w-5 h-5 text-neutral-400 shrink-0" />
          <select
            value={translateMode}
            onChange={(e) => setTranslateMode(e.target.value as TranslateMode)}
            className="w-full sm:w-44 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-200 text-sm rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 block p-2.5 outline-none transition-all cursor-pointer"
          >
            <option value="all">全部翻译</option>
            <option value="values-only">仅翻译值 (保留键名)</option>
          </select>
        </div>

        {/* Model Selection */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Cpu className="w-5 h-5 text-neutral-400 shrink-0" />
          <select
            value={`${selectedProvider}:${selectedModel}`}
            onChange={handleModelChange}
            className="w-full sm:w-56 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-200 text-sm rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 block p-2.5 outline-none transition-all cursor-pointer"
          >
            {PROVIDERS.map(provider => (
              <optgroup label={provider.name} key={provider.id}>
                {provider.models.map(model => (
                  <option value={`${provider.id}:${model.id}`} key={model.id}>
                    {model.name}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

      </div>
    </div>
  );
}
