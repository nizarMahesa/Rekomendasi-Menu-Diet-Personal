// ============================================
// CHATBOT MODULE — FIX ENTER & TOMBOL KIRIM
// ============================================

var GEMINI_API_KEY = localStorage.getItem('geminiApiKey') || '';

// Deteksi otomatis elemen HTML agar tidak error null
function getChatElements() {
  var input = document.getElementById('chatInput') || document.getElementById('chat-input') || document.getElementById('inputChat');
  var box = document.getElementById('chatMessages') || document.getElementById('chatBox') || document.getElementById('chat-box');
  var form = document.getElementById('chatForm') || document.getElementById('chat-form') || (input ? input.closest('form') : null);
  var btn = document.getElementById('sendBtn') || document.getElementById('send-btn') || document.getElementById('btnSend');

  return { input: input, box: box, form: form, btn: btn };
}

// API KEY MANAGEMENT
function saveApiKey() {
  var input = document.getElementById('apiKeyInput');
  if (!input) return;
  var key = input.value.trim();
  if (!key) {
    alert('API key tidak boleh kosong.');
    return;
  }
  localStorage.setItem('geminiApiKey', key);
  GEMINI_API_KEY = key;
  alert('✅ API Key berhasil disimpan!');
  var sec = document.getElementById('apiKeySection');
  if (sec) sec.style.display = 'none';
}
window.saveApiKey = saveApiKey;

function toggleApiKeySection() {
  var sec = document.getElementById('apiKeySection');
  if (sec) sec.style.display = sec.style.display === 'none' ? 'block' : 'none';
}
window.toggleApiKeySection = toggleApiKeySection;

// BUILD CONTEXT
function buildUserContext() {
  var user = JSON.parse(localStorage.getItem('user')) || {};
  var bahanUser = JSON.parse(localStorage.getItem('bahanUser')) || [];
  var plan = JSON.parse(localStorage.getItem('mealPlan')) || [];

  var bahanNama = bahanUser.map(function(id) {
    var b = (typeof BAHAN !== 'undefined') ? BAHAN.find(function(x) { return x.id === id; }) : null;
    return b ? b.nama : '';
  }).filter(Boolean);

  var menuList = (typeof MENU !== 'undefined') ? MENU.map(function(m) {
    return 'ID ' + m.id + ': ' + m.nama + ' (' + m.kalori + ' kkal, P:' + m.protein + 'g, K:' + m.karbo + 'g, L:' + m.lemak + 'g)';
  }).join('\n') : '';

  var savedMenu = plan.map(function(p) {
    var m = (typeof MENU !== 'undefined') ? MENU.find(function(x) { return x.id === p.id; });
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

// KIRIM KE GEMINI API
async function sendToGemini(userMessage) {
  if (!GEMINI_API_KEY) {
    throw new Error('API key belum diset. Klik tombol ⚙️ untuk memasukkan API key.');
  }

  var context = buildUserContext();
  var systemPrompt = buildSystemPrompt(context);
  var url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' + GEMINI_API_KEY;

  var body = {
    contents: [
      {
        role: 'user',
        parts: [{ text: systemPrompt + '\n\nPERTANYAAN USER: ' + userMessage }]
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
    throw new Error('Gemini API Error (' + response.status + '). Cek kembali API Key kamu.');
  }

  var data = await response.json();

  if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
    throw new Error('Respons Gemini tidak valid.');
  }

  return data.candidates[0].content.parts[0].text;
}

// TAMPILKAN DI CHAT BOX
function appendChatMessage(role, text) {
  var els = getChatElements();
  if (!els.box) return;

  var div = document.createElement('div');
  div.className = 'chat-msg chat-' + role;

  if (role === 'user') {
    div.innerHTML = '<div class="chat-bubble chat-bubble-user">' + escapeHtml(text) + '</div>';
  } else if (role === 'bot') {
    div.innerHTML = '<div class="chat-bubble chat-bubble-bot">' + formatBotText(text) + '</div>';
  } else {
    div.innerHTML = '<div class="chat-bubble chat-bubble-system">' + escapeHtml(text) + '</div>';
  }

  els.box.appendChild(div);
  els.box.scrollTop = els.box.scrollHeight;
}

function escapeHtml(text) {
  return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function formatBotText(text) {
  var esc = escapeHtml(text);
  return esc.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/\n/g, '<br>');
}

// FUNGSI UTAMA KIRIM PESAN
async function sendChatMessage() {
  var els = getChatElements();
  if (!els.input) {
    alert('Input chat tidak ditemukan di HTML! Pastikan elemen input memiliki id="chatInput"');
    return;
  }

  var msg = els.input.value.trim();
  if (!msg) return;

  if (!GEMINI_API_KEY) {
    appendChatMessage('system', '⚠️ API key belum diset. Klik tombol ⚙️ di atas untuk memasukkan API key Gemini.');
    var sec = document.getElementById('apiKeySection');
    if (sec) sec.style.display = 'block';
    return;
  }

  appendChatMessage('user', msg);
  els.input.value = '';

  appendChatMessage('system', '⏳ AI sedang mengetik...');
  var box = els.box;
  var typingMsg = box ? box.lastChild : null;

  try {
    var reply = await sendToGemini(msg);
    if (typingMsg && typingMsg.parentNode) {
      box.removeChild(typingMsg);
    }
    appendChatMessage('bot', reply);
  } catch (err) {
    if (typingMsg && typingMsg.parentNode) {
      box.removeChild(typingMsg);
    }
    appendChatMessage('system', '❌ ' + err.message);
    console.error(err);
  }
}
window.sendChatMessage = sendChatMessage;

// INISIALISASI EVENT LISTENER (ENTER & CLICK)
function initChatEvents() {
  var els = getChatElements();

  if (els.input) {
    els.input.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendChatMessage();
      }
    });
  }

  if (els.form) {
    els.form.addEventListener('submit', function(e) {
      e.preventDefault();
      sendChatMessage();
    });
  }

  if (els.btn) {
    els.btn.addEventListener('click', function(e) {
      e.preventDefault();
      sendChatMessage();
    });
  }

  if (!GEMINI_API_KEY) {
    var sec = document.getElementById('apiKeySection');
    if (sec) sec.style.display = 'block';
  } else {
    var inp = document.getElementById('apiKeyInput');
    if (inp) inp.value = GEMINI_API_KEY;
  }
}

// Panggil fungsi saat DOM siap
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initChatEvents);
} else {
  initChatEvents();
}

console.log('💬 Chatbot Module Loaded & Event Handlers Active');
