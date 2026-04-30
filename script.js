const API = 'http://ec2-13-229-75-225.ap-southeast-1.compute.amazonaws.com';

// ── Load prompts into dropdown on page load ───────────────
async function loadPrompts() {
  const sel = document.getElementById('promptSelect');
  try {
    //const res = await fetch(`${API}/prompts`);
    const res = await fetch(`${API}/api/llm/questions`);
    const prompts = await res.json();
    console.log(prompts);
    sel.innerHTML =
      '<option value="">— Select a prompt —</option>' +
      prompts.data.map(p => `<option value="${p.id}">${p.questionText}</option>`).join('');

    sel.addEventListener('change', () => {
      document.getElementById('submitBtn').disabled = !sel.value;
    });
  } catch {
    sel.innerHTML = '<option value="">⚠ Could not reach API</option>';
  }
}

// ── Submit selected prompt and display AI response ────────
async function submitPrompt() {
  const sel  = document.getElementById('promptSelect');
  const btn  = document.getElementById('submitBtn');
  const wrap = document.getElementById('resultWrap');
  const body = document.getElementById('resultBody');
  const tag  = document.getElementById('statusTag');

  if (!sel.value) return;

  // Loading state
  btn.classList.add('loading');
  btn.disabled = true;
  wrap.classList.remove('visible');

  try {
    // const res = await fetch(`${API}/api/llm/ask/2`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ prompt_id: parseInt(sel.value) }),
    // });

    const res = await fetch(`${API}/api/llm/ask/${sel.value}`, {
    method: 'GET',
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Server error');

    // body.textContent = data.result;
    //body.textContent = data.data.answer;
    body.innerHTML = marked.parse(data.data.answer);
    body.classList.remove('error');
    tag.textContent = '✓ Success';
    tag.style.cssText = '';

  } catch (err) {
    body.textContent = `Error: ${err.message}`;
    body.classList.add('error');
    tag.textContent = '✗ Error';
    tag.style.background = 'rgba(255,92,114,.12)';
    tag.style.color = 'var(--err)';
    tag.style.borderColor = 'rgba(255,92,114,.25)';

  } finally {
    btn.classList.remove('loading');
    btn.disabled = false;
    wrap.classList.add('visible');
  }
}

// ── Copy AI response to clipboard ────────────────────────
async function copyResult() {
  const text = document.getElementById('resultBody').textContent;
  await navigator.clipboard.writeText(text);
  const btn = document.querySelector('.copy-btn');
  btn.textContent = 'Copied!';
  setTimeout(() => btn.textContent = 'Copy', 1800);
}

// ── Init ─────────────────────────────────────────────────
loadPrompts();
