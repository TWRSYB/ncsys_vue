import hljs from 'highlight.js/lib/core';
import sql from 'highlight.js/lib/languages/sql';
import 'highlight.js/styles/github.css'; // 选择样式

// 注册SQL语言
hljs.registerLanguage('sql', sql);

// 高亮函数
export function highlightSQL(sql) {
  return hljs.highlight(sql, { language: 'sql' }).value;
}