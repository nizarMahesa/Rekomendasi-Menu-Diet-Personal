// ============================================
// CHATBOT MODULE — Gemini API (Fixed Model)
// ============================================
// API key gratis: https://aistudio.google.com/app/apikey
// Model: gemini-2.5-flash (pengganti resmi gemini-1.5-flash)

var GEMINI_API_KEY = localStorage.getItem('geminiApiKey') || '';

// ============================================
// API KEY MANAGEMENT
// ============================================
function saveApiKey() {
  var input = document.getElementById('apiKeyInput');
  if (!input) return;
  var key = input.value.trim();
  if (!key) {
    window.showToast('API key tidak boleh kosong.', 'warning', 1400);
    return;
  }
  localStorage.setItem('geminiApiKey', key);
  GEMINI_API_KEY = key;
  window.showToast('✅ API key tersimpan', 'success', 1400);
  document.getElementById('apiKeySection').style.display = 'none';
}
window.saveApiKey = saveApiKey;

function toggleApiKeySection() {
  var sec = document.getElementById('apiKeySection');
  if (sec) sec.style.display = sec.style.display === 'none' ? 'block' : 'none';
}
window.toggleApiKeySection = toggleApiKeySection;

// ============================================
// BUILD CONTEXT
// ============================================
function buildUserContext() {
  var user = JSON.parse(localStorage.getItem('user')) || {};
  var bahanUser = JSON.parse(localStorage.getItem('bahanUser')) || [];
  var plan = JSON.parse(localStorage.getItem('mealPlan')) || [];

  var bahanNama = bahanUser.map(function(id) {
    var b = BAHAN.find(function(x) { return x.id === id; });
    return b ? b.nama : '';
  }).filter(Boolean);

  var menuList = MENU.map(function(m) {
    return 'ID ' + m.id + ': ' + m.nama + ' (' + m.kalori + ' kkal, P:' + m.protein + 'g, K:' + m.karbo + 'g, L:' + m.lemak + 'g)';
  }).join('\n');

  var savedMenu = plan.map(function(p) {
    var m = MENU.find(function(x) { return x.id === p.id; });
    return m ? m.nama : '';
  }).filter(Boolean);

  return {
    user: user,
    bahanTersedia: bahanNama,
    menuTersimpan: savedMenu,
    daftarMenu: menuList
  };
}

function buildSystemPrompt(context) {
  var c = context;
  return 'Kamu adalah asisten gizi "DietPlan" yang membantu user memilih menu diet sesuai ketersediaan bahan di dapur mereka.\n\n' +
    'INFORMASI USER:\n' +
    '- Nama: ' + (c.user.nama || 'User') + '\n' +
    '- Umur: ' + (c.user.umur || '-') + ' tahun\n' +
    '- Target kalori harian: ' + (c.user.target || '-') + ' kkal\n' +
    '- Alergi: ' + (c.user.alergi || 'tidak ada') + '\n\n' +
    'BAHAN YANG TERSEDIA DI DAPUR USER:\n' +
    (c.bahanTersedia.length > 0 ? c.bahanTersedia.join(', ') : '(belum dipilih)') + '\n\n' +
    'MENU YANG SUDAH DISIMPAN USER:\n' +
    (c.menuTersimpan.length > 0 ? c.menuTersimpan.join(', ') : '(belum ada)') + '\n\n' +
    'DAFTAR SEMUA MENU YANG TERSEDIA DI SISTEM:\n' + c.daftarMenu + '\n\n' +
    'ATURAN JAWABAN:\n' +
    '1. Jawab SINGKAT, maksimal 3 paragraf.\n' +
    '2. Selalu kaitkan jawaban dengan BAHAN YANG TERSEDIA.\n' +
    '3. Kalau user tanya menu, rekomendasikan dari DAFTAR MENU di atas (sebutkan ID-nya).\n' +
    '4. Kalau user tanya resep, jelaskan langkah singkat.\n' +
    '5. Kalau bahan tidak tersedia, sarankan pengganti yang ada di dapur user.\n' +
    '6. Gunakan Bahasa Indonesia santai, jangan kaku.\n' +
    '7. Jangan pernah merekomendasikan menu yang mengandung alergi user.';
}

// ============================================
// SEND TO GEMINI — MODEL SUDAH DIPERBAIKI
// ============================================
async function sendToGemini(userMessage) {
  if (!GEMINI_API_KEY) {
    throw new Error('API key belum diset. Klik ⚙️ untuk memasukkan API key.');
  }

  var context = buildUserContext();
  var systemPrompt = buildSystemPrompt(context);

  // ⚠️ MODEL BARU: gemini-2.5-flash (pengganti gemini-1.5-flash yang sudah dihentikan)
var url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=' + GEMINI_API_KEY;

  var body = {
    contents: [
      {
        role: 'user',
        parts: [
          { text: systemPrompt + '\n\nPERTANYAAN USER: ' + userMessage }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 500
    }
  };

  var response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    var errText = await response.text();
    throw new Error('Gemini API error: ' + response.status + ' — ' + errText);
  }

  var data = await response.json();

  if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
    throw new Error('Response Gemini tidak valid.');
  }

  return data.candidates[0].content.parts[0].text;
}

// ============================================
// UI CHATBOT
// ============================================
function appendChatMessage(role, text) {
  var box = document.getElementById('chatMessages');
  if (!box) return;

  var div = document.createElement('div');
  div.className = 'chat-msg chat-' + role;

  if (role === 'user') {
    div.innerHTML = '<div class="chat-bubble chat-bubble-user">' + escapeHtml(text) + '</div>';
  } else if (role === 'bot') {
    div.innerHTML = '<div class="chat-bubble chat-bubble-bot">' + formatBotText(text) + '</div>';
  } else {
    div.innerHTML = '<div class="chat-bubble chat-bubble-system">' + escapeHtml(text) + '</div>';
  }

  box.appendChild(div);
  box.scrollTop = box.scrollHeight;
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function formatBotText(text) {
  var esc = escapeHtml(text);
  esc = esc.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
  esc = esc.replace(/\n/g, '<br>');
  return esc;
}

async function sendChatMessage() {
  var input = document.getElementById('chatInput');
  if (!input) return;

  var msg = input.value.trim();
  if (!msg) return;

  if (!GEMINI_API_KEY) {
    appendChatMessage('system', '⚠️ API key belum diset. Klik tombol ⚙️ di atas untuk memasukkan API key Gemini.');
    return;
  }

  appendChatMessage('user', msg);
  input.value = '';

  appendChatMessage('system', '⏳ AI sedang mengetik...');
  var box = document.getElementById('chatMessages');
  var typingMsg = box.lastChild;

  try {
    var reply = await sendToGemini(msg);
    box.removeChild(typingMsg);
    appendChatMessage('bot', reply);
  } catch (err) {
    box.removeChild(typingMsg);
    appendChatMessage('system', '❌ ' + err.message);
    console.error(err);
  }
}
window.sendChatMessage = sendChatMessage;

// ============================================
// INIT
// ============================================
document.addEventListener('DOMContentLoaded', function() {
  var input = document.getElementById('chatInput');
  if (input) {
    input.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendChatMessage();
      }
    });
  }

  if (!GEMINI_API_KEY) {
    var sec = document.getElementById('apiKeySection');
    if (sec) sec.style.display = 'block';
  } else {
    var inp = document.getElementById('apiKeyInput');
    if (inp) inp.value = GEMINI_API_KEY;
  }
});

console.log('💬 Chatbot Module loaded (model: gemini-2.5-flash)');