const form = document.querySelector('#tool');
const fields = form.elements;
const status = document.querySelector('#status');
const copy = document.querySelector('#copy');
const formatJson = document.querySelector('#format-json');

form.addEventListener('change', () => {
  const encrypt = fields.operation.value === 'encrypt';
  formatJson.hidden = encrypt;
  document.querySelector('#input-label').textContent = encrypt ? '输入明文' : '输入密文';
  document.querySelector('#output-label').textContent = encrypt ? '输出密文' : '输出明文';
  document.querySelector('#run').textContent = encrypt ? '加密' : '解密';
});

form.addEventListener('input', () => {
  fields.result.value = '';
  copy.disabled = true;
  formatJson.disabled = true;
  status.textContent = '';
});

form.addEventListener('submit', event => {
  event.preventDefault();
  fields.result.value = '';
  copy.disabled = true;
  formatJson.disabled = true;
  try {
    fields.result.value = transformAES(fields.source.value, Object.fromEntries(new FormData(form)));
    copy.disabled = !fields.result.value;
    formatJson.disabled = copy.disabled || fields.operation.value !== 'decrypt';
    status.textContent = '转换完成';
  } catch (error) {
    status.textContent = error.message;
  }
});

copy.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(fields.result.value);
    status.textContent = '已复制';
  } catch {
    fields.result.select();
    status.textContent = '已选中结果，请手动复制。';
  }
});

formatJson.addEventListener('click', () => {
  const value = fields.result.value;
  try {
    JSON.parse(value);
  } catch {
    status.textContent = '明文不是有效的 JSON';
    return;
  }

  // Format the original tokens to preserve large integers, escapes and key order.
  let depth = 0;
  const tokens = value.match(/"(?:[^"\\]|\\[\s\S])*"|[{}\[\],:]|[^\s{}\[\],:]+/g);
  const newline = () => '\n' + '  '.repeat(depth);
  fields.result.value = tokens.map((token, index) => {
    if (token === '{' || token === '[') {
      depth++;
      return tokens[index + 1] === (token === '{' ? '}' : ']') ? token : token + newline();
    }
    if (token === '}' || token === ']') {
      depth--;
      return (tokens[index - 1] === (token === '}' ? '{' : '[') ? '' : newline()) + token;
    }
    if (token === ',') return token + newline();
    if (token === ':') return ': ';
    return token;
  }).join('');
  status.textContent = 'JSON 已格式化';
});
