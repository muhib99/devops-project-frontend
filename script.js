/* eslint-disable no-unused-vars */
const API = 'http://ec2-15-134-218-182.ap-southeast-2.compute.amazonaws.com';

// ── Stepper helpers ───────────────────────────────────────
function setStep(step) {
  [1, 2, 3].forEach(i => {
    document.getElementById(`step-${i}`).classList.remove('active', 'complete', 'error');
  });
  [1, 2].forEach(i => {
    document.getElementById(`line-${i}`).classList.remove('complete');
  });
  for (let i = 1; i < step; i++) {
    document.getElementById(`step-${i}`).classList.add('complete');
    if (i < 3) document.getElementById(`line-${i}`).classList.add('complete');
  }
  if (step <= 3) {
    document.getElementById(`step-${step}`).classList.add('active');
  }
}

function setStepError() {
  [1, 2, 3].forEach(i => {
    const el = document.getElementById(`step-${i}`);
    if (el.classList.contains('active')) {
      el.classList.remove('active');
      el.classList.add('error');
    }
  });
}

function resetStepper() {
  [1, 2, 3].forEach(i => {
    document.getElementById(`step-${i}`).classList.remove('active', 'complete', 'error');
  });
  [1, 2].forEach(i => {
    document.getElementById(`line-${i}`).classList.remove('complete');
  });
}

// ── Load prompts into dropdown on page load ───────────────
async function loadPrompts() {
  const sel = document.getElementById('promptSelect');
  try {
    const res = await fetch(`${API}/api/llm/questions`);
    const prompts = await res.json();
    console.log(prompts);
    sel.innerHTML =
      '<option value="">— Select a prompt —</option>' +
      prompts.data.map(p => `<option value="${p.id}">${p.questionText}</option>`).join('');

    sel.addEventListener('change', () => {
      document.getElementById('submitBtn').disabled = !sel.value;
      resetStepper(); // ← reset stepper when user picks a new prompt
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
  setStep(1); // ← Step 1: Prompt Submitted

  try {
    await new Promise(r => setTimeout(r, 400)); // small delay so user sees step 1
    setStep(2); // ← Step 2: AI Processing

    const res = await fetch(`${API}/api/llm/ask/${sel.value}`, {
      method: 'GET',
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Server error');

    setStep(3); // ← Step 3: Response Ready
    body.innerHTML = marked.parse(data.data.answer);
    body.classList.remove('error');
    tag.textContent = '✓ Success';
    tag.style.cssText = '';

  } catch (err) {
    setStepError(); // ← mark current step as error
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