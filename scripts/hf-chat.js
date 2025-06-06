// hf-chat.js

let HF_API_KEY = "";

async function loadApiKey() {
  try {
    const res = await fetch('scripts/hf-api-key.txt');
    if (!res.ok) throw new Error('API key dosyası bulunamadı.');
    const text = await res.text();
    const keyLine = text.split('\n').find(line => line.trim().startsWith('hf_'));
    if (keyLine) {
      HF_API_KEY = keyLine.trim();
    }
  } catch (err) {
    console.warn('API Key yüklenemedi:', err);
  }
}

const chatForm = document.getElementById('chat-form');
const userInput = document.getElementById('user-input');
const chatBox = document.getElementById('chat-box');
const HF_API_URL = 'https://api-inference.huggingface.co/models/facebook/blenderbot-400M-distill';

function addMessage(text, sender) {
  const div = document.createElement('div');
  div.classList.add('chat-message', sender);
  div.textContent = text;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}

window.addEventListener('DOMContentLoaded', async () => {
  await loadApiKey();
});

chatForm.addEventListener('submit', async function (e) {
  e.preventDefault();

  const message = userInput.value.trim();
  if (!message) return;

  addMessage(message, 'user');
  userInput.value = '';

  addMessage('Yazılıyor...', 'ai');

  try {
    const response = await fetch(HF_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(HF_API_KEY ? { Authorization: `Bearer ${HF_API_KEY}` } : {})
      },
      body: JSON.stringify({
        inputs: { text: message }
      })
    });

    if (!response.ok) throw new Error('API yanıtı hatalı.');

    const data = await response.json();
    const aiText = data.generated_text || 'Üzgünüm, yanıt alınamadı.';

    const lastAiMsg = chatBox.querySelector('.chat-message.ai:last-child');
    if (lastAiMsg) {
      lastAiMsg.textContent = aiText;
    } else {
      addMessage(aiText, 'ai');
    }

  } catch (err) {
    console.error(err);
    const lastAiMsg = chatBox.querySelector('.chat-message.ai:last-child');
    if (lastAiMsg) {
      lastAiMsg.textContent = 'Üzgünüm, şu anda bir hata oluştu. Lütfen tekrar deneyin.';
    }
  }
});