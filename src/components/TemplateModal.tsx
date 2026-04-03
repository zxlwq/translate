import React, { useState } from 'react';
import { X, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Template {
  title: string;
  content: string;
}

interface TemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  templates: Template[];
  onSelect: (content: string) => void;
}

export function TemplateModal({ isOpen, onClose, templates, onSelect }: TemplateModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [variables, setVariables] = useState<Record<string, string>>({});

  const filteredTemplates = templates.filter(t => 
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const extractVariables = (text: string) => {
    const regex = /\[(.*?)\]|\{\{(.*?)\}\}/g;
    const vars: string[] = [];
    let match;
    while ((match = regex.exec(text)) !== null) {
      vars.push(match[1] || match[2]);
    }
    return [...new Set(vars)];
  };

  const handleTemplateClick = (template: Template) => {
    const vars = extractVariables(template.content);
    if (vars.length > 0) {
      setSelectedTemplate(template);
      const initialVars: Record<string, string> = {};
      vars.forEach(v => initialVars[v] = '');
      setVariables(initialVars);
    } else {
      onSelect(template.content);
      onClose();
    }
  };

  const handleFillVariables = () => {
    if (!selectedTemplate) return;
    let finalContent = selectedTemplate.content;
    Object.entries(variables).forEach(([key, value]) => {
      const regex1 = new RegExp(`\\[${key}\\]`, 'g');
      const regex2 = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      finalContent = finalContent.replace(regex1, value || `[${key}]`).replace(regex2, value || `{{${key}}}`);
    });
    onSelect(finalContent);
    setSelectedTemplate(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={onClose}
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        >
          <div className="px-6 py-4 border-b border-neutral-100 dark:border-neutral-800 flex justify-between items-center bg-neutral-50/50 dark:bg-neutral-900/50">
            <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200">
              {selectedTemplate ? '填写模板变量' : '提示词模板库'}
            </h3>
            <button onClick={() => {
              if (selectedTemplate) setSelectedTemplate(null);
              else onClose();
            }} className="p-2 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-full transition-colors">
              <X className="w-5 h-5 text-neutral-500 dark:text-neutral-400" />
            </button>
          </div>

          <div className="p-6 overflow-y-auto flex-1">
            {selectedTemplate ? (
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 rounded-xl text-sm mb-6">
                  {selectedTemplate.content}
                </div>
                {Object.keys(variables).map(v => (
                  <div key={v} className="space-y-2">
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">{v}</label>
                    <input
                      type="text"
                      value={variables[v]}
                      onChange={e => setVariables({...variables, [v]: e.target.value})}
                      className="w-full px-4 py-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
                      placeholder={`输入 ${v}...`}
                    />
                  </div>
                ))}
                <button
                  onClick={handleFillVariables}
                  className="w-full mt-6 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors"
                >
                  确认并使用
                </button>
              </div>
            ) : (
              <>
                <div className="relative mb-6">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                  <input
                    type="text"
                    placeholder="搜索模板..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredTemplates.map((template, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleTemplateClick(template)}
                      className="text-left p-4 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-md transition-all group bg-white dark:bg-neutral-800"
                    >
                      <h4 className="font-medium text-neutral-800 dark:text-neutral-200 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {template.title}
                      </h4>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400 line-clamp-2 leading-relaxed">
                        {template.content}
                      </p>
                    </button>
                  ))}
                  {filteredTemplates.length === 0 && (
                    <div className="col-span-full py-12 text-center text-neutral-500 dark:text-neutral-400">
                      没有找到匹配的模板
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
