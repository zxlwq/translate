import React from 'react';
import { Sparkles, Moon, Sun, Trash, LayoutTemplate, FileText } from 'lucide-react';

interface HeaderProps {
  isDarkMode: boolean;
  setIsDarkMode: (value: boolean) => void;
  handleFreeMemory: () => void;
  setShowTemplates: (value: boolean) => void;
  setShowAdmin: (value: boolean) => void;
}

export function Header({
  isDarkMode,
  setIsDarkMode,
  handleFreeMemory,
  setShowTemplates,
  setShowAdmin
}: HeaderProps) {
  return (
    <header className="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 sticky top-0 z-10 transition-colors">
      <div className="w-full px-4 md:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-sm">
            <Sparkles className="w-5 h-5" />
          </div>
          <h1 className="font-semibold text-lg tracking-tight text-neutral-900 dark:text-white">提示词翻译</h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleFreeMemory}
            className="p-2 text-neutral-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-full transition-colors"
            title="释放离线模型内存"
          >
            <Trash className="w-5 h-5" />
          </button>
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 text-neutral-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-full transition-colors"
            title="切换主题"
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <button
            onClick={() => setShowTemplates(true)}
            className="p-2 text-neutral-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-full transition-colors"
            title="提示词模板"
          >
            <LayoutTemplate className="w-5 h-5" />
          </button>
          <button
            onClick={() => setShowAdmin(true)}
            className="p-2 text-neutral-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-full transition-colors"
            title="查看已保存的提示词"
          >
            <FileText className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
