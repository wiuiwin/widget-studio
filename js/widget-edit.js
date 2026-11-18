const script = document.currentScript;
const params = new URLSearchParams(location.search);
if (params.get('preview') !== '1') {
  const editor = new URL('../' + script.dataset.editor + '/', location.href);
  params.set('edit', '1');
  editor.search = params;
  const link = document.createElement('a');
  link.className = 'widget-edit';
  link.href = editor.href;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.textContent = '위젯 수정';
  document.body.append(link);
}
