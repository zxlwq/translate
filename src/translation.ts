import { pipeline, env } from '@xenova/transformers';

env.remoteHost = 'https://huggingface.co';
env.allowLocalModels = false;

let translatorZhEn: any = null;
let translatorEnZh: any = null;

const progressCallback = (data: any) => {
  if (data.status === 'progress') {
    const progress = Math.round(data.progress * 100);
    const loaded = (data.loaded / 1024 / 1024).toFixed(1);
    const total = (data.total / 1024 / 1024).toFixed(1);
    self.postMessage({ 
      status: 'loading', 
      message: `正在下载模型: ${progress}% (${loaded}MB/${total}MB)` 
    });
  } else if (data.status === 'initiate') {
    self.postMessage({ 
      status: 'loading', 
      message: `正在准备下载: ${data.name}` 
    });
  } else if (data.status === 'done') {
    self.postMessage({ 
      status: 'loading', 
      message: `模型下载完成: ${data.name}` 
    });
  }
};

self.addEventListener('message', async (event) => {
  const { text, direction, id } = event.data;

  try {
    let translator;
    if (direction === 'zh-to-en') {
      if (!translatorZhEn) {
        self.postMessage({ status: 'loading', message: '正在加载中英翻译模型 (首次需下载约300MB)...' });
        translatorZhEn = await pipeline('translation', 'Xenova/opus-mt-zh-en', {
          progress_callback: progressCallback,
          quantized: true
        });
      }
      translator = translatorZhEn;
    } else {
      if (!translatorEnZh) {
        self.postMessage({ status: 'loading', message: '正在加载英中翻译模型 (首次需下载约300MB)...' });
        translatorEnZh = await pipeline('translation', 'Xenova/opus-mt-en-zh', {
          progress_callback: progressCallback,
          quantized: true
        });
      }
      translator = translatorEnZh;
    }

    self.postMessage({ status: 'loading', message: '正在进行离线翻译...' });
    const result = await translator(text);
    
    self.postMessage({ 
      status: 'complete', 
      id, 
      result: result[0].translation_text 
    });
  } catch (error: any) {
    self.postMessage({ status: 'error', id, error: error.message });
  }
});
