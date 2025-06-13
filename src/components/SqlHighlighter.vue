

<!-- 不好使弃用 -->
<!-- 不好使弃用 -->
<!-- 不好使弃用 -->
<!-- 不好使弃用 -->
<!-- 不好使弃用 -->
<!-- 不好使弃用 -->
<!-- 不好使弃用 -->
<!-- 不好使弃用 -->
<!-- 不好使弃用 -->
<!-- 不好使弃用 -->
<!-- 不好使弃用 -->


<template>
  <pre class="sql-container"><code v-html="processedTokens"></code></pre>
</template>

<script setup>
import { computed } from 'vue';

// 语法定义配置
const SYNTAX_CONFIG = {
  keywords: new Set([
    'SELECT', 'INSERT', 'UPDATE', 'DELETE', 'CREATE', 'TABLE',
    'PRIMARY', 'KEY', 'FROM', 'WHERE', 'JOIN', 'ON', 'ENGINE',
    'CHARSET', 'COMMENT', 'SET', 'VALUES', 'NOT', 'NULL', 'DEFAULT'
  ]),
  datatypes: new Set(['INT', 'VARCHAR', 'TEXT', 'TIMESTAMP', 'CHAR']),
  operators: new Set(['AND', 'OR', 'IN', 'AS', 'ON', 'BY', 'GROUP', 'ORDER']),
  stringDelimiters: ["'", '"'],
  blockComments: ['/*', '*/'],
  lineComments: ['--'],
  objectDelimiters: '`'
};

const props = defineProps({
  sql: {
    type: String,
    required: true
  }
});

const processedTokens = computed(() => {
  if (!props.sql) return '';

  const tokens = [];
  let currentToken = { text: '', type: 'default' };
  let state = 'default';
  let escapeNext = false;
  let inString = false;
  let stringDelimiter = '';
  let inBlockComment = false;
  let commentStart = 0;

  // 辅助函数：提交当前token并重置
  const flushToken = () => {
    if (currentToken.text) {
      tokens.push(currentToken);
      currentToken = { text: '', type: 'default' };
    }
  };

  for (let i = 0; i < props.sql.length; i++) {
    const char = props.sql[i];
    const nextChar = props.sql[i+1] || '';

    if (escapeNext) {
      currentToken.text += char;
      escapeNext = false;
      continue;
    }

    // 状态处理机
    switch(state) {
      case 'default':
        if (inString) {
          if (char === stringDelimiter) {
            inString = false;
            currentToken.text += char;
            flushToken();
            state = 'default';
          } else {
            currentToken.text += char;
          }
          continue;
        }

        if (inBlockComment) {
          currentToken.text += char;
          if (char === '*' && nextChar === '/') {
            inBlockComment = false;
            currentToken.text += nextChar;
            i++; // 跳过闭合符
            flushToken();
          }
          continue;
        }

        if (SYNTAX_CONFIG.lineComments[0] === char && 
            SYNTAX_CONFIG.lineComments[0] === props.sql.substr(i, 2)) {
          flushToken();
          currentToken = { text: props.sql.substr(i, 2), type: 'comment' };
          i++; // 跳过第二个字符
          state = 'line-comment';
          continue;
        }

        if (SYNTAX_CONFIG.blockComments[0] === char && 
            SYNTAX_CONFIG.blockComments[0] === props.sql.substr(i, 2)) {
          flushToken();
          currentToken = { text: props.sql.substr(i, 2), type: 'comment' };
          i++;
          inBlockComment = true;
          state = 'block-comment';
          continue;
        }

        if (SYNTAX_CONFIG.stringDelimiters.includes(char)) {
          flushToken();
          stringDelimiter = char;
          currentToken = { text: char, type: 'string' };
          inString = true;
          state = 'string';
          continue;
        }

        if (char === SYNTAX_CONFIG.objectDelimiters) {
          flushToken();
          currentToken = { text: char, type: 'object' };
          state = 'object';
          continue;
        }

        if (char.match(/[\s(),;]/)) {
          flushToken();
          currentToken = { text: char, type: 'symbol' };
          tokens.push(currentToken);
          continue;
        }

        if (char.match(/[A-Za-z]/)) {
          currentToken.text += char;
          currentToken.type = 'identifier';
          continue;
        }

        currentToken.text += char;
        break;

      case 'string':
        if (char === '\\') {
          escapeNext = true;
        }
        currentToken.text += char;
        break;

      case 'object':
        if (char === SYNTAX_CONFIG.objectDelimiters) {
          currentToken.text += char;
          flushToken();
          state = 'default';
        } else {
          currentToken.text += char;
        }
        break;

      case 'line-comment':
        currentToken.text += char;
        if (char === '\n') {
          flushToken();
          state = 'default';
        }
        break;

      case 'block-comment':
        currentToken.text += char;
        break;
    }
  }

  // 处理剩余内容
  flushToken();

  // 生成带样式的tokens
  return tokens.map(token => {
    let className = '';
    switch(token.type) {
      case 'keyword':    className = 'keyword'; break;
      case 'datatype':   className = 'datatype'; break;
      case 'operator':   className = 'operator'; break;
      case 'string':     className = 'string'; break;
      case 'comment':    className = 'comment'; break;
      case 'object':     className = 'object'; break;
      case 'symbol':     className = 'symbol'; break;
      default:           className = 'default';
    }

    // 关键字特殊处理（需要完整匹配）
    if (token.type === 'identifier' && 
        SYNTAX_CONFIG.keywords.has(token.text.toUpperCase())) {
      return `<span class="keyword">${token.text}</span>`;
    }

    // 数据类型特殊处理
    if (token.type === 'identifier' && 
        SYNTAX_CONFIG.datatypes.has(token.text.toUpperCase())) {
      return `<span class="datatype">${token.text}</span>`;
    }

    // 运算符特殊处理
    if (token.type === 'identifier' && 
        SYNTAX_CONFIG.operators.has(token.text.toUpperCase())) {
      return `<span class="operator">${token.text}</span>`;
    }

    return `<span class="${className}">${token.text}</span>`;
  }).join('');
});
</script>

<style scoped>
.sql-container {
  background: #2d2d2d;
  padding: 1em;
  border-radius: 8px;
  overflow-x: auto;
  font-family: 'Fira Code', monospace;
  font-size: 14px;
  line-height: 1.4;
  white-space: pre-wrap;
}

/* 语义化颜色方案 */
:deep(.keyword) { color: #c792ea; font-weight: 600; }
.datatype { color: #89ddff; }
.operator { color: #c3e88d; }
.symbol { color: #80cbc4; }
.string { color: #f07178; }
.comment { 
  color: #6a9955; 
  font-style: italic;
}
.object { color: #98c379; }
.default { color: #d4d4d4; }
</style>