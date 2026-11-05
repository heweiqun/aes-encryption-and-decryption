const form = document.querySelector('#tool');
const fields = form.elements;
const status = document.querySelector('#status');
const copy = document.querySelector('#copy');

form.addEventListener('change', () => {
  const encrypt = fields.operation.value === 'encrypt';
  document.querySelector('#input-label').textContent = encrypt ? '输入明文' : '输入密文';
  document.querySelector('#output-label').textContent = encrypt ? '输出密文' : '输出明文';
  document.querySelector('#run').textContent = encrypt ? '加密' : '解密';
});

form.addEventListener('input', () => {
  fields.result.value = '';
  copy.disabled = true;
  status.textContent = '';
});

form.addEventListener('submit', event => {
  event.preventDefault();
  fields.result.value = '';
  copy.disabled = true;
  try {
    fields.result.value = transformAES(fields.source.value, Object.fromEntries(new FormData(form)));
    copy.disabled = !fields.result.value;
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
