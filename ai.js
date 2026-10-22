// ============================================
// AI MODULE — CBF + KNN + XAI + HYBRID
// ============================================
// Load SETELAH data.js, SEBELUM rekomendasi.js

// ============================================
// 1. VECTORIZATION
// ============================================
function vectorizeMenu(menu, userProfile) {
  var kaloriNorm = Math.min(menu.kalori / 700, 1);
  var proteinNorm = Math.min(menu.protein / 45, 1);
  var karboNorm = Math.min(menu.karbo / 80, 1);
  var lemakNorm = Math.min(menu.lemak / 40, 1);

  var bahanUser = userProfile.bahanUser || [];
  var cocokBahan = menu.bahan.filter(function(id) {
    return bahanUser.indexOf(id) !== -1;
  }).length;
  var ketersediaan = menu.bahan.length > 0 ? cocokBahan / menu.bahan.length : 0;

  var bahanNama = menu.bahan.map(function(id) {
    var b = BAHAN.find(function(x) { return x.id === id; });
    return b ? b.nama.toLowerCase() : '';
  });
  var alergiUser = (userProfile.alergi || '').toLowerCase()
    .split(',').map(function(s) { return s.trim(); })
    .filter(function(s) { return s !== ''; });
  var adaAlergi = alergiUser.some(function(al) {
    return bahanNama.some(function(bn) { return bn.indexOf(al) !== -1; });
  });
  var cocokAlergi = adaAlergi ? 0 : 1;

  return [kaloriNorm, proteinNorm, karboNorm, lemakNorm, ketersediaan, cocokAlergi, 1];
}

function vectorizeUser(userProfile, targetKalori) {
  var targetPerMenu = targetKalori / 3;
  var targetProtein = (targetKalori * 0.25) / 4 / 3;
  var targetKarbo = (targetKalori * 0.50) / 4 / 3;
  var targetLemak = (targetKalori * 0.25) / 9 / 3;

  return [
    Math.min(targetPerMenu / 700, 1),
    Math.min(targetProtein / 45, 1),
    Math.min(targetKarbo / 80, 1),
    Math.min(targetLemak / 40, 1),
    1.0, 1.0, 1.0
  ];
}

// ============================================
// 2. COSINE SIMILARITY
// ============================================
function cosineSimilarity(vecA, vecB) {
  if (vecA.length !== vecB.length) return 0;
  var dot = 0, magA = 0, magB = 0;
  for (var i = 0; i < vecA.length; i++) {
    dot += vecA[i] * vecB[i];
    magA += vecA[i] * vecA[i];
    magB += vecB[i] * vecB[i];
  }
  magA = Math.sqrt(magA); magB = Math.sqrt(magB);
  if (magA === 0 || magB === 0) return 0;
  return dot / (magA * magB);
}

// ============================================
// 3. CONTENT-BASED FILTERING
// ============================================
function contentBasedFiltering(userProfile, targetKalori, menuPool) {
  var userVec = vectorizeUser(userProfile, targetKalori);
  var scored = menuPool.map(function(menu) {
    var menuVec = vectorizeMenu(menu, userProfile);
    var sim = cosineSimilarity(userVec, menuVec);
    return {
      menu: menu,
      similarity: sim,
      score: Math.round(sim * 1000) / 10,
      method: 'CBF'
    };
  });
  scored.sort(function(a, b) { return b.score - a.score; });
  return scored;
}

// ============================================
// 4. K-NEAREST NEIGHBORS
// ============================================
function knnRecommend(userProfile, targetKalori, menuPool, k) {
  k = k || 5;
  var plan = JSON.parse(localStorage.getItem('mealPlan')) || [];
  var likedMenus = plan.map(function(p) {
    return MENU.find(function(m) { return m.id === p.id; });
  }).filter(Boolean);

  if (likedMenus.length === 0) {
    var cbf = contentBasedFiltering(userProfile, targetKalori, menuPool);
    return cbf.map(function(r) {
      return { menu: r.menu, score: r.score, similarity: r.similarity, method: 'KNN (fallback CBF)' };
    });
  }

  var likedVectors = likedMenus.map(function(m) { return vectorizeMenu(m, userProfile); });
  var scored = menuPool.map(function(menu) {
    var menuVec = vectorizeMenu(menu, userProfile);
    var sims = likedVectors.map(function(lv) { return cosineSimilarity(menuVec, lv); });
    sims.sort(function(a, b) { return b - a; });
    var topK = sims.slice(0, k);
    var avg = topK.reduce(function(s, v) { return s + v; }, 0) / topK.length;
    return { menu: menu, similarity: avg, score: Math.round(avg * 1000) / 10, method: 'KNN' };
  });
  scored.sort(function(a, b) { return b.score - a.score; });
  return scored;
}

// ============================================
// 5. HYBRID RECOMMENDER (CBF + KNN + Rating)
// ============================================
var HYBRID_WEIGHTS = {
  cbf: 0.5,      // 50% dari CBF
  knn: 0.3,      // 30% dari KNN
  rating: 0.2    // 20% dari rating user
};

function hybridRecommend(userProfile, targetKalori, menuPool) {
  var cbfResults = contentBasedFiltering(userProfile, targetKalori, menuPool);
  var knnResults = knnRecommend(userProfile, targetKalori, menuPool, 5);
  var ratings = getRatings();

  var cbfMap = {}; cbfResults.forEach(function(r) { cbfMap[r.menu.id] = r.score; });
  var knnMap = {}; knnResults.forEach(function(r) { knnMap[r.menu.id] = r.score; });

  var hybrid = menuPool.map(function(menu) {
    var cbfScore = cbfMap[menu.id] || 0;
    var knnScore = knnMap[menu.id] || 0;
    var ratingScore = (ratings[menu.id] || 3) * 20;

    var final = (cbfScore * HYBRID_WEIGHTS.cbf) +
                (knnScore * HYBRID_WEIGHTS.knn) +
                (ratingScore * HYBRID_WEIGHTS.rating);

    return {
      menu: menu,
      similarity: final / 100,
      score: Math.round(final * 10) / 10,
      method: 'Hybrid',
      breakdown: {
        cbf: Math.round(cbfScore * 10) / 10,
        knn: Math.round(knnScore * 10) / 10,
        rating: Math.round(ratingScore * 10) / 10
      }
    };
  });

  hybrid.sort(function(a, b) { return b.score - a.score; });
  return hybrid;
}

// ============================================
// 6. EXPLAINABLE AI (XAI)
// ============================================
function explainRecommendation(menu, userProfile, targetKalori) {
  var reasons = [];
  var bahanUser = userProfile.bahanUser || [];
  var targetPerMenu = targetKalori / 3;

  var cocok = menu.bahan.filter(function(id) { return bahanUser.indexOf(id) !== -1; }).length;
  var total = menu.bahan.length;
  var persenBahan = Math.round((cocok / total) * 100);

  if (persenBahan >= 80) {
    reasons.push({ icon: '🥇', text: '<b>' + persenBahan + '% bahan tersedia</b> di dapurmu (' + cocok + ' dari ' + total + ' bahan)', impact: 'high' });
  } else if (persenBahan >= 50) {
    reasons.push({ icon: '🥈', text: '<b>' + persenBahan + '% bahan tersedia</b> — sebagian perlu belanja atau substitusi', impact: 'medium' });
  } else {
    reasons.push({ icon: '🥉', text: 'Hanya <b>' + persenBahan + '% bahan tersedia</b> — perlu banyak belanja', impact: 'low' });
  }

  var diffKal = menu.kalori - targetPerMenu;
  var diffPersen = Math.round((Math.abs(diffKal) / targetPerMenu) * 100);

  if (Math.abs(diffKal) <= 50) {
    reasons.push({ icon: '🎯', text: 'Kalori <b>sangat sesuai target per makan</b> (' + menu.kalori + ' kkal vs target ' + Math.round(targetPerMenu) + ' kkal)', impact: 'high' });
  } else if (Math.abs(diffKal) <= 150) {
    reasons.push({ icon: '📊', text: 'Kalori <b>cukup dekat</b> dengan target (' + (diffKal > 0 ? '+' : '') + Math.round(diffKal) + ' kkal, ' + diffPersen + '% selisih)', impact: 'medium' });
  } else {
    reasons.push({ icon: '⚠️', text: 'Kalori <b>' + (diffKal > 0 ? 'lebih tinggi' : 'lebih rendah') + '</b> ' + diffPersen + '% dari target per makan', impact: 'low' });
  }

  var targetProtein = (targetKalori * 0.25) / 4 / 3;
  if (menu.protein >= targetProtein * 1.1) {
    reasons.push({ icon: '💪', text: 'Protein <b>tinggi</b> (' + menu.protein + 'g) — bagus untuk otot & kenyang lebih lama', impact: 'high' });
  } else if (menu.protein >= targetProtein * 0.8) {
    reasons.push({ icon: '✅', text: 'Protein <b>sesuai kebutuhan</b> (' + menu.protein + 'g)', impact: 'medium' });
  } else {
    reasons.push({ icon: '📉', text: 'Protein <b>kurang</b> (' + menu.protein + 'g) — tambah lauk protein jika perlu', impact: 'low' });
  }

  var targetLemak = (targetKalori * 0.25) / 9 / 3;
  if (menu.lemak <= targetLemak * 1.2) {
    reasons.push({ icon: '🥑', text: 'Lemak <b>terkontrol</b> (' + menu.lemak + 'g)', impact: 'medium' });
  } else {
    reasons.push({ icon: '🧈', text: 'Lemak <b>agak tinggi</b> (' + menu.lemak + 'g) — hati-hati kalau sedang diet ketat', impact: 'low' });
  }

  var subs = 0;
  menu.bahan.forEach(function(bid) {
    if (bahanUser.indexOf(bid) === -1) {
      if ((SUBSTITUSI[bid] || []).some(function(sid) { return bahanUser.indexOf(sid) !== -1; })) {
        subs++;
      }
    }
  });

  if (subs > 0) {
    reasons.push({ icon: '🔄', text: '<b>' + subs + ' bahan bisa disubstitusi</b> dengan yang ada di dapurmu', impact: 'high' });
  }

  var ratings = getRatings();
  if (ratings[menu.id]) {
    var stars = '⭐'.repeat(ratings[menu.id]);
    reasons.push({ icon: '⭐', text: 'Rating dari pengguna: <b>' + stars + '</b> (' + ratings[menu.id] + '/5)', impact: ratings[menu.id] >= 4 ? 'high' : 'medium' });
  }

  if (menu.vegetarian) {
    reasons.push({ icon: '🌱', text: 'Menu <b>vegetarian</b> — cocok untuk diet nabati', impact: 'medium' });
  }

  return reasons;
}

// ============================================
// 7. RATING SYSTEM
// ============================================
function getRatings() {
  return JSON.parse(localStorage.getItem('menuRatings')) || {};
}

function saveRating(menuId, rating) {
  var ratings = getRatings();
  ratings[menuId] = rating;
  localStorage.setItem('menuRatings', JSON.stringify(ratings));
}

function getUserRatings() {
  return JSON.parse(localStorage.getItem('userRatings')) || {};
}

function saveUserRating(menuId, rating) {
  var ratings = getUserRatings();
  ratings[menuId] = { rating: rating, timestamp: Date.now() };
  localStorage.setItem('userRatings', JSON.stringify(ratings));

  var globalRatings = getRatings();
  var old = globalRatings[menuId];
  if (old) {
    globalRatings[menuId] = Math.round((old + rating) / 2);
  } else {
    globalRatings[menuId] = rating;
  }
  localStorage.setItem('menuRatings', JSON.stringify(globalRatings));
}

// ============================================
// 8. AUTO-TUNING BOBOT
// ============================================
function autoTuneWeights() {
  var plan = JSON.parse(localStorage.getItem('mealPlan')) || [];
  if (plan.length < 3) return;

  var lengkap = 0;
  plan.forEach(function(p) {
    var m = MENU.find(function(x) { return x.id === p.id; });
    if (!m) return;
    var bahanUser = JSON.parse(localStorage.getItem('bahanUser')) || [];
    var cocok = m.bahan.filter(function(id) { return bahanUser.indexOf(id) !== -1; }).length;
    if (cocok / m.bahan.length >= 0.8) lengkap++;
  });

  var persenLengkap = lengkap / plan.length;

  if (persenLengkap >= 0.7) {
    HYBRID_WEIGHTS.cbf = 0.6;
    HYBRID_WEIGHTS.knn = 0.25;
    HYBRID_WEIGHTS.rating = 0.15;
  } else if (persenLengkap <= 0.3) {
    HYBRID_WEIGHTS.cbf = 0.4;
    HYBRID_WEIGHTS.knn = 0.4;
    HYBRID_WEIGHTS.rating = 0.2;
  }

  localStorage.setItem('hybridWeights', JSON.stringify(HYBRID_WEIGHTS));
}

function loadHybridWeights() {
  var saved = JSON.parse(localStorage.getItem('hybridWeights'));
  if (saved) HYBRID_WEIGHTS = saved;
}

// ============================================
// 9. EXPORT
// ============================================
window.vectorizeMenu = vectorizeMenu;
window.vectorizeUser = vectorizeUser;
window.cosineSimilarity = cosineSimilarity;
window.contentBasedFiltering = contentBasedFiltering;
window.knnRecommend = knnRecommend;
window.hybridRecommend = hybridRecommend;
window.explainRecommendation = explainRecommendation;
window.getRatings = getRatings;
window.saveRating = saveRating;
window.getUserRatings = getUserRatings;
window.saveUserRating = saveUserRating;
window.autoTuneWeights = autoTuneWeights;
window.loadHybridWeights = loadHybridWeights;
window.HYBRID_WEIGHTS = HYBRID_WEIGHTS;

loadHybridWeights();
console.log('🤖 AI Module loaded: CBF + KNN + Hybrid + XAI + Rating');

// ============================================
// CHATBOT MODULE — Gemini API (FIXED MODEL & REFRESH)
// ============================================
var GEMINI_API_KEY = localStorage.getItem('geminiApiKey') || '';

// ============================================
// API KEY MANAGEMENT
// ============================================
function saveApiKey() {
  var input = document.getElementById('apiKeyInput');
  if (!input) return;
  var key = input.value.trim();
  if (!key) {
    if (window.showToast) window.showToast('API key tidak boleh kosong.', 'warning', 1400);
    return;
  }
  localStorage.setItem('geminiApiKey', key);
  GEMINI_API_KEY = key;
  if (window.showToast) window.showToast('✅ API key tersimpan', 'success', 1400);
  var sec = document.getElementById('apiKeySection');
  if (sec) sec.style.display = 'none';
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
    var b = (typeof BAHAN !== 'undefined') ? BAHAN.find(function(x) { return x.id === id; }) : null;
    return b ? b.nama : '';
  }).filter(Boolean);

  var menuList = (typeof MENU !== 'undefined') ? MENU.map(function(m) {
    return 'ID ' + m.id + ': ' + m.nama + ' (' + m.kalori + ' kkal, P:' + m.protein + 'g, K:' + m.karbo + 'g, L:' + m.lemak + 'g)';
  }).join('\n') : '';

  var savedMenu = plan.map(function(p) {
    var m = (typeof MENU !== 'undefined') ? MENU.find(function(x) { return x.id === p.id; }) : null;
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
// SEND TO GEMINI (URL FIX MODEL RESMI)
// ============================================
async function sendToGemini(userMessage) {
  if (!GEMINI_API_KEY) {
    throw new Error('API key belum diset. Klik ⚙️ untuk memasukkan API key.');
  }

  var context = buildUserContext();
  var systemPrompt = buildSystemPrompt(context);

  // ⚠️ FIX: Endpoint resmi Gemini 1.5 Flash
  var url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' + GEMINI_API_KEY;

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

// ============================================
// INIT (PREVENT REFRESH ON FORM SUBMIT)
// ============================================
document.addEventListener('DOMContentLoaded', function() {
  var input = document.getElementById('chatInput');
  var form = document.getElementById('chatForm') || (input ? input.closest('form') : null);

  // Mencegah form ke-refresh pas diklik Enter / Submit
  if (form) {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      sendChatMessage();
    });
  }

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

console.log('💬 Chatbot Module loaded (Model: gemini-1.5-flash)');
