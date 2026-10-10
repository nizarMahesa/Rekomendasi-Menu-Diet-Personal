// ============================================
// REKOMENDASI.JS — 4 Mode AI + XAI + Rating
// ============================================
var user = JSON.parse(localStorage.getItem('user'));
var bahanUser = JSON.parse(localStorage.getItem('bahanUser')) || [];
if (!user) window.location.href = 'index.html';

var showChooseBahanNotice = (bahanUser.length === 0);
var selectedCompare = [];
var currentFilter = { search:'', veg:false, kategori:'', minKal:0, maxKal:0, sort:'skor' };
var currentAIMode = 'cbf';

var GUIDE_DATA = {
  protein: ['Dada Ayam','Telur','Ikan','Tahu','Tempe','Daging Sapi','Udang','Cumi','Edamame','Yogurt'],
  sayur:   ['Brokoli','Bayam','Pak Choy','Sawi','Selada','Kubis','Asparagus','Timun','Wortel','Tomat','Jamur','Buncis','Kangkung'],
  karbo:   ['Oatmeal','Nasi Merah','Ubi Jalar','Kentang','Quinoa','Roti Gandum','Jagung','Beras Cokelat'],
  buah:    ['Apel','Alpukat','Pir','Pisang','Melon','Semangka','Jeruk','Pepaya','Jambu','Kiwi'],
  camilan: ['Almond','Walnut','Biji Chia','Popcorn','Selai Kacang','Cokelat Hitam'],
  minuman: ['Air Putih','Teh Hijau','Kopi Hitam','Infused Water']
};

var target = user.target;
var alergiList = (user.alergi || '').toLowerCase().split(',').map(function(s){ return s.trim(); }).filter(function(s){ return s !== ''; });

// ============================================
// HELPER
// ============================================
function menuKenaAlergi(menu){
  var bahanNama = menu.bahan.map(function(id){
    var b = BAHAN.find(function(x){ return x.id === id; });
    return b ? b.nama.toLowerCase() : '';
  });
  return alergiList.some(function(al){
    return bahanNama.some(function(bn){ return bn.indexOf(al) !== -1; });
  });
}

// ============================================
// REKOMENDASI BY MODE
// ============================================
function hitungRekomendasiByMode(mode){
  var pool = MENU.filter(function(m){ return !menuKenaAlergi(m); });

  var userProfile = { user: user, bahanUser: bahanUser, alergi: user.alergi || '' };
  var results = [];

  if (mode === 'cbf') {
    results = contentBasedFiltering(userProfile, target, pool);
  } else if (mode === 'knn') {
    results = knnRecommend(userProfile, target, pool, 5);
  } else if (mode === 'hybrid') {
    results = hybridRecommend(userProfile, target, pool);
  } else {
    results = contentBasedFiltering(userProfile, target, pool);
  }

  // Lengkapi info
  results = results.map(function(r) {
    var menu = r.menu;
    var cocok = menu.bahan.filter(function(id) { return bahanUser.indexOf(id) !== -1; }).length;
    var totalBahan = menu.bahan.length;

    var analisis = { tersedia: [], tidakTersedia: [], substitusiMap: {} };
    menu.bahan.forEach(function(bid) {
      var bahan = BAHAN.find(function(b) { return b.id === bid; });
      if (!bahan) return;
      if (bahanUser.indexOf(bid) !== -1) {
        analisis.tersedia.push(bahan);
      } else {
        analisis.tidakTersedia.push(bahan);
        var subs = (SUBSTITUSI[bid] || [])
          .filter(function(sid) { return bahanUser.indexOf(sid) !== -1; })
          .map(function(sid) { return BAHAN.find(function(b) { return b.id === sid; }); })
          .filter(Boolean);
        if (subs.length > 0) analisis.substitusiMap[bid] = subs;
      }
    });

    return {
      menu: menu,
      skor: r.score,
      similarity: r.similarity,
      method: r.method,
      breakdown: r.breakdown || null,
      cocok: cocok,
      totalBahan: totalBahan,
      persenBahan: Math.round((cocok / totalBahan) * 100),
      jmlSubstitusi: Object.keys(analisis.substitusiMap).length,
      analisis: analisis
    };
  });

  return results.slice(0, 10);
}

function applyFilters(list){
  var f = currentFilter;
  var out = list.filter(function(h){
    var m = h.menu;
    if(f.search && m.nama.toLowerCase().indexOf(f.search.toLowerCase()) === -1 &&
       m.deskripsi.toLowerCase().indexOf(f.search.toLowerCase()) === -1) return false;
    if(f.kategori && m.kategori !== f.kategori) return false;
    if(f.veg && !m.vegetarian) return false;
    if(f.minKal && m.kalori < f.minKal) return false;
    if(f.maxKal && m.kalori > f.maxKal) return false;
    return true;
  });
  if(f.sort === 'kalori') out.sort(function(a,b){ return a.menu.kalori - b.menu.kalori; });
  else if(f.sort === 'protein') out.sort(function(a,b){ return b.menu.protein - a.menu.protein; });
  else out.sort(function(a,b){ return b.skor - a.skor; });
  return out;
}

// ============================================
// GUIDE & THUMB
// ============================================
function renderGuidePreview(){
  var el = document.getElementById('guidePreview');
  if(!el) return;
  var out = '';
  for(var kat in GUIDE_DATA){
    out += '<b>' + kat.charAt(0).toUpperCase() + kat.slice(1) + '</b>: ' + GUIDE_DATA[kat].slice(0,5).join(', ') + '...<br>';
  }
  el.innerHTML = out;
}

function getMenuThumbnail(menu){
  return window.generateMenuThumbnail ? window.generateMenuThumbnail(menu) : '';
}

// ============================================
// RENDER
// ============================================
function renderRecommendations(){
  var infoEl = document.getElementById('infoRek');
  if(infoEl) infoEl.innerHTML = 'Target kalori: <span class="badge-kalori">' + target + ' kkal/hari</span> | Bahan dipilih: <b>' + bahanUser.length + '</b> item | Mode: <b>' + currentAIMode.toUpperCase() + '</b>';

  var alergiEl = document.getElementById('alergiBadge');
  if(alergiEl){
    alergiEl.innerHTML = alergiList.length
      ? '<div class="alert alert-warning py-2 small">🚫 Menu mengandung <b>' + alergiList.join(', ') + '</b> disaring otomatis.</div>'
      : '';
  }

  var noticeEl = document.getElementById('rekomendasiNotice');
  if(noticeEl){
    noticeEl.innerHTML = showChooseBahanNotice
      ? '<div class="alert alert-info">Kamu belum memilih bahan. <a href="bahan.html" class="btn btn-sm btn-outline-success ms-2">Pilih Bahan</a> <button class="btn btn-sm btn-success ms-2" onclick="pilihBahanDefault()">Gunakan bahan umum</button></div>'
      : '';
  }

  var top = applyFilters(hitungRekomendasiByMode(currentAIMode));
  var hasilEl = document.getElementById('hasilRek');
  if(!hasilEl) return;

  if(top.length === 0){
    hasilEl.innerHTML = '<div class="alert alert-warning">Tidak ada menu yang cocok. Coba pilih lebih banyak bahan.</div>';
    return;
  }

  var ratings = getRatings();
  var userRatings = getUserRatings();

  var html = '<div class="row">';
  top.forEach(function(h){
    var m = h.menu;
    var cocokText = (bahanUser.length === 0) ? '—' : h.cocok + '/' + h.totalBahan;
    var persenText = (bahanUser.length === 0) ? '—' : h.persenBahan + '%';
    var thumb = getMenuThumbnail(m);
    var isSaved = window.isMenuSaved(m.id);

    // Substitusi
    var substitusiHTML = '';
    if (h.jmlSubstitusi > 0) {
      substitusiHTML = '<div class="alert alert-warning py-2 px-3 small mt-2 mb-0">' +
        '<b>🔄 Bahan pengganti:</b><br>';
      for (var bid in h.analisis.substitusiMap) {
        var bahanAsli = BAHAN.find(function(b){ return b.id === parseInt(bid); });
        var subNames = h.analisis.substitusiMap[bid].map(function(s){ return s.nama; }).join(', ');
        substitusiHTML += '• <b>' + bahanAsli.nama + '</b> → ' + subNames + '<br>';
      }
      substitusiHTML += '</div>';
    }

    var tidakTersediaHTML = '';
    var tanpaSub = h.analisis.tidakTersedia.filter(function(b){
      return !h.analisis.substitusiMap[b.id];
    });
    if (tanpaSub.length > 0 && bahanUser.length > 0) {
      var names = tanpaSub.map(function(b){ return b.nama; }).join(', ');
      tidakTersediaHTML = '<div class="small text-danger mt-1">❌ Tidak tersedia: ' + names + '</div>';
    }

    // Mode badge
    var modeBadge = '';
    if (currentAIMode === 'cbf') modeBadge = '<span class="badge bg-primary">📐 CBF</span>';
    else if (currentAIMode === 'knn') modeBadge = '<span class="badge bg-success">👥 KNN</span>';
    else if (currentAIMode === 'hybrid') modeBadge = '<span class="badge bg-dark">🧠 Hybrid</span>';

    // Breakdown hybrid
    var breakdownHTML = '';
    if (h.breakdown) {
      breakdownHTML = '<div class="small text-muted mt-1" style="font-size:11px">' +
        '📐 CBF: ' + h.breakdown.cbf + ' | 👥 KNN: ' + h.breakdown.knn + ' | ⭐ Rating: ' + h.breakdown.rating +
        '</div>';
    }

    // Rating user
    var userRating = userRatings[m.id] ? userRatings[m.id].rating : 0;
    var starHTML = '';
    for (var i = 1; i <= 5; i++) {
      starHTML += '<span class="star ' + (i <= userRating ? 'star-filled' : 'star-empty') + '" ' +
                  'data-menu-id="' + m.id + '" data-rating="' + i + '">★</span>';
    }

    // Rata-rata rating global
    var avgRating = ratings[m.id] ? ratings[m.id] : 0;
    var avgText = avgRating > 0 ? '<span class="small text-muted ms-2">(' + avgRating + '/5)</span>' : '';

    html += '<div class="col-md-6 mb-3">' +
      '<div class="card menu-card p-3 h-100" style="position:relative">' +
        '<div style="position:absolute;right:12px;top:12px;z-index:5">' +
          '<input type="checkbox" class="compare-check" data-id="' + m.id + '" ' + (selectedCompare.indexOf(m.id) !== -1 ? 'checked' : '') + ' title="Bandingkan">' +
        '</div>' +
        '<div class="d-flex gap-3 align-items-start">' +
          '<div class="menu-thumb-wrap" style="background-image:url(\'' + thumb + '\')"></div>' +
          '<div style="flex:1">' +
            '<div class="d-flex justify-content-between align-items-start">' +
              '<h5 style="margin:0">' + m.nama + '</h5>' +
              '<span class="skor">' + h.skor + '%</span>' +
            '</div>' +
            '<p class="text-muted small mb-2">' + m.deskripsi + '</p>' +
            '<div class="skor-progress"><div class="skor-bar" data-val="' + h.skor + '" style="width:0%"></div></div>' +
            breakdownHTML +
            '<div class="mb-2 mt-2">' +
              modeBadge + ' ' +
              '<span class="badge-kalori">' + m.kalori + ' kkal</span> ' +
              '<span class="badge bg-info text-dark">P: ' + m.protein + 'g</span> ' +
              '<span class="badge bg-secondary">K: ' + m.karbo + 'g</span> ' +
              '<span class="badge bg-danger">L: ' + m.lemak + 'g</span>' +
            '</div>' +
            '<p class="small mb-1">✅ Bahan tersedia: <b>' + cocokText + '</b> (' + persenText + ')</p>' +
            tidakTersediaHTML +
            substitusiHTML +
            // Rating
            '<div class="mt-2 d-flex align-items-center">' +
              '<span class="small text-muted me-2">Rating kamu:</span>' +
              '<div class="star-rating" data-menu-id="' + m.id + '">' + starHTML + '</div>' +
              avgText +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="d-flex gap-2 mt-3">' +
          '<button class="btn btn-sm btn-outline-info xai-btn" data-id="' + m.id + '" title="Kenapa direkomendasikan?">🧠</button>' +
          '<a href="detail.html?id=' + m.id + '" class="btn btn-sm btn-primary ms-auto">Lihat Resep →</a>' +
          '<button class="btn btn-sm ' + (isSaved ? 'btn-secondary' : 'save-btn') + '" onclick="saveMenuDanRefresh(' + m.id + ', \'' + m.nama.replace(/'/g, "\\'") + '\')" ' + (isSaved ? 'disabled' : '') + '>' +
            (isSaved ? '✓ Tersimpan' : 'Simpan') +
          '</button>' +
        '</div>' +
      '</div>' +
    '</div>';
  });
  html += '</div>';
  hasilEl.innerHTML = html;

  setTimeout(function(){
    document.querySelectorAll('.skor-bar').forEach(function(bar){
      bar.style.width = bar.getAttribute('data-val') + '%';
    });
  }, 100);

  // Compare checkbox
  hasilEl.querySelectorAll('.compare-check').forEach(function(ch){
    ch.addEventListener('change', function(e){
      var id = parseInt(e.target.getAttribute('data-id'));
      if(e.target.checked){
        if(selectedCompare.indexOf(id) === -1) selectedCompare.push(id);
        if(selectedCompare.length > 3) selectedCompare.shift();
      } else {
        selectedCompare = selectedCompare.filter(function(x){ return x !== id; });
      }
    });
  });

  // ⭐ Rating hover & click
  hasilEl.querySelectorAll('.star-rating').forEach(function(container){
    var menuId = parseInt(container.getAttribute('data-menu-id'));
    var stars = container.querySelectorAll('.star');

    stars.forEach(function(star){
      star.addEventListener('mouseenter', function(){
        var r = parseInt(star.getAttribute('data-rating'));
        stars.forEach(function(s){
          s.classList.toggle('star-hover', parseInt(s.getAttribute('data-rating')) <= r);
        });
      });

      star.addEventListener('mouseleave', function(){
        stars.forEach(function(s){ s.classList.remove('star-hover'); });
      });

      star.addEventListener('click', function(e){
        e.stopPropagation();
        var r = parseInt(star.getAttribute('data-rating'));
        saveUserRating(menuId, r);
        window.showToast('⭐ Rating ' + r + '/5 tersimpan untuk menu ini', 'success', 1400);
        renderRecommendations();
      });
    });
  });

  // 🧠 XAI button
  hasilEl.querySelectorAll('.xai-btn').forEach(function(btn){
    btn.addEventListener('click', function(e){
      e.stopPropagation();
      var id = parseInt(btn.getAttribute('data-id'));
      openXAI(id);
    });
  });
}

// ============================================
// XAI MODAL
// ============================================
function openXAI(menuId){
  var menu = MENU.find(function(m){ return m.id === menuId; });
  if (!menu) return;

  var userProfile = { user: user, bahanUser: bahanUser, alergi: user.alergi || '' };
  var reasons = explainRecommendation(menu, userProfile, target);

  var html = '<div class="mb-3">' +
    '<h6>' + menu.nama + '</h6>' +
    '<p class="text-muted small mb-0">' + menu.deskripsi + '</p>' +
    '</div>';

  html += '<div class="alert alert-info small">🧠 <b>Penjelasan AI</b>: berikut alasan kenapa menu ini direkomendasikan untukmu.</div>';

  html += '<div class="xai-reasons">';
  reasons.forEach(function(r){
    var cls = r.impact === 'high' ? 'xai-high' : (r.impact === 'medium' ? 'xai-medium' : 'xai-low');
    html += '<div class="xai-reason ' + cls + '">' +
      '<span class="xai-icon">' + r.icon + '</span>' +
      '<span>' + r.text + '</span>' +
      '</div>';
  });
  html += '</div>';

  document.getElementById('xaiContent').innerHTML = html;
  new bootstrap.Modal(document.getElementById('xaiModal')).show();
}
window.openXAI = openXAI;

// ============================================
// SWITCH MODE
// ============================================
function switchAIMode(mode){
  currentAIMode = mode;
  var info = document.getElementById('aiModeInfo');
  var chatPanel = document.getElementById('chatPanel');
  var weightPanel = document.getElementById('weightPanel');

  if (chatPanel) chatPanel.style.display = 'none';
  if (weightPanel) weightPanel.style.display = 'none';

  if (mode === 'cbf') {
    info.innerHTML = '📐 <b>CBF</b>: menghitung <i>cosine similarity</i> antara vektor profil user dengan vektor menu.';
    renderRecommendations();
  } else if (mode === 'knn') {
    info.innerHTML = '👥 <b>KNN</b>: mencari menu mirip dengan menu yang pernah kamu simpan (K=5). <br><small>💡 Simpan beberapa menu dulu biar akurat.</small>';
    renderRecommendations();
  } else if (mode === 'hybrid') {
    info.innerHTML = '🧠 <b>Hybrid</b>: gabungan CBF + KNN + Rating user. Bobot otomatis di-tuning sesuai perilaku user.';
    if (weightPanel) {
      weightPanel.style.display = 'block';
      updateWeightDisplay();
    }
    renderRecommendations();
  } else if (mode === 'chat') {
    info.innerHTML = '💬 <b>Chatbot</b>: tanya jawab dengan Gemini. AI tahu bahan & menu yang tersedia.';
    if (chatPanel) chatPanel.style.display = 'block';
    var chatUser = document.getElementById('chatUserName');
    if (chatUser) chatUser.textContent = user.nama || 'User';
  }
}
window.switchAIMode = switchAIMode;

function updateWeightDisplay(){
  var w = HYBRID_WEIGHTS;
  var el1 = document.getElementById('weightCBF');
  var el2 = document.getElementById('weightKNN');
  var el3 = document.getElementById('weightRating');
  if (el1) el1.textContent = Math.round(w.cbf * 100);
  if (el2) el2.textContent = Math.round(w.knn * 100);
  if (el3) el3.textContent = Math.round(w.rating * 100);
}

function retune(){
  autoTuneWeights();
  updateWeightDisplay();
  renderRecommendations();
  window.showToast('🔄 Bobot AI di-tune ulang berdasarkan perilakumu', 'success', 1800);
}
window.retune = retune;

// ============================================
// SAVE MENU
// ============================================
function saveMenuDanRefresh(id, name){
  window.saveMenu(id, name);
  renderRecommendations();
}
window.saveMenuDanRefresh = saveMenuDanRefresh;

// ============================================
// QUICK ADD
// ============================================
function pilihBahanDefault(){
  bahanUser = [1, 2, 3, 4, 7, 13, 17, 19, 25, 26];
  localStorage.setItem('bahanUser', JSON.stringify(bahanUser));
  showChooseBahanNotice = false;
  renderRecommendations();
}
window.pilihBahanDefault = pilihBahanDefault;

function addAvailableFromGuide(){
  var foundIds = {};
  bahanUser.forEach(function(id){ foundIds[id] = true; });
  var allKeys = [];
  for(var k in GUIDE_DATA){ allKeys = allKeys.concat(GUIDE_DATA[k]); }
  var lowerNames = allKeys.map(function(s){ return s.toLowerCase(); });
  BAHAN.forEach(function(b){
    var name = b.nama.toLowerCase();
    for(var i=0; i<lowerNames.length; i++){
      var key = lowerNames[i];
      if(key.length < 3) continue;
      if(name.indexOf(key) !== -1 || key.indexOf(name) !== -1){
        foundIds[b.id] = true;
        break;
      }
    }
  });
  bahanUser = Object.keys(foundIds).map(function(x){ return parseInt(x); }).sort(function(a,b){ return a-b; });
  localStorage.setItem('bahanUser', JSON.stringify(bahanUser));
  showChooseBahanNotice = false;
  renderRecommendations();
  window.showToast('Bahan ditambahkan dari panduan', 'success', 1600);
}
window.addAvailableFromGuide = addAvailableFromGuide;

function addProteinCommon(){
  var keys = ['dada ayam','telur','ikan','tahu','tempe','ayam','udang','cumi'];
  var found = {};
  bahanUser.forEach(function(id){ found[id] = true; });
  BAHAN.forEach(function(b){
    var name = b.nama.toLowerCase();
    for(var i=0; i<keys.length; i++){
      if(name.indexOf(keys[i]) !== -1){ found[b.id] = true; break; }
    }
  });
  bahanUser = Object.keys(found).map(function(x){ return parseInt(x); });
  localStorage.setItem('bahanUser', JSON.stringify(bahanUser));
  showChooseBahanNotice = false;
  renderRecommendations();
  window.showToast('Sumber protein ditambahkan', 'success', 1600);
}
window.addProteinCommon = addProteinCommon;

// ============================================
// PLAN MODAL
// ============================================
function openPlanModal(){
  var plan = JSON.parse(localStorage.getItem('mealPlan')) || [];
  var container = document.getElementById('planList');
  if(!container) return;

  if(plan.length === 0){
    container.innerHTML = '<div class="text-muted small">Belum ada menu disimpan.</div>';
  } else {
    var out = '';
    plan.forEach(function(p){
      var m = MENU.find(function(x){ return x.id === p.id; });
      if(m){
        out += '<div class="plan-item">' +
          '<img src="' + getMenuThumbnail(m) + '" class="plan-thumb" alt="thumb">' +
          '<div class="meta"><b>' + m.nama + '</b><div class="text-muted small">' + m.deskripsi + '</div></div>' +
          '<button class="btn btn-sm btn-outline-danger" onclick="removeFromPlan(' + m.id + ')">Hapus</button>' +
          '</div>';
      }
    });
    container.innerHTML = out;
  }
  if(window.bootstrap){
    new bootstrap.Modal(document.getElementById('planModal')).show();
  }
}
window.openPlanModal = openPlanModal;

function removeFromPlan(id){
  var plan = JSON.parse(localStorage.getItem('mealPlan')) || [];
  plan = plan.filter(function(p){ return p.id !== id; });
  localStorage.setItem('mealPlan', JSON.stringify(plan));
  openPlanModal();
  renderRecommendations();
}
window.removeFromPlan = removeFromPlan;

// ============================================
// EXPORT & PRINT
// ============================================
function exportPlanJSON(){
  var plan = JSON.parse(localStorage.getItem('mealPlan')) || [];
  var data = plan.map(function(p){ return { id:p.id, name:p.name }; });
  var blob = new Blob([JSON.stringify(data, null, 2)], { type:'application/json' });
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url; a.download = 'rencana-makanan.json'; a.click();
  URL.revokeObjectURL(url);
  window.showToast('Export JSON berhasil', 'success', 1600);
}
window.exportPlanJSON = exportPlanJSON;

function printPlan(){
  var plan = JSON.parse(localStorage.getItem('mealPlan')) || [];
  var w = window.open('', '_blank');
  var html = '<!doctype html><html><head><title>Rencana Makanan</title>' +
    '<style>body{font-family:sans-serif;padding:20px} li{margin-bottom:6px}</style></head><body>' +
    '<h2>Rencana Makanan</h2><ul>';
  plan.forEach(function(p){
    var m = MENU.find(function(x){ return x.id === p.id; });
    html += '<li><strong>' + (m ? m.nama : p.name) + '</strong>' + (m ? ' - ' + m.kalori + ' kkal' : '') + '</li>';
  });
  html += '</ul><script>window.print();<\/script></body></html>';
  w.document.open(); w.document.write(html); w.document.close();
}
window.printPlan = printPlan;

// ============================================
// COMPARE
// ============================================
function openCompareModal(){
  var area = document.getElementById('compareArea');
  if(!area) return;
  if(selectedCompare.length === 0){
    window.showToast('Pilih minimal 1 menu untuk dibandingkan.', 'info', 1400);
    return;
  }
  var out = '';
  var colSize = Math.floor(12 / Math.min(3, selectedCompare.length));
  selectedCompare.slice(0,3).forEach(function(id){
    var m = MENU.find(function(x){ return x.id === id; });
    if(m){
      out += '<div class="col-md-' + colSize + ' mb-3">' +
        '<div class="card p-3 h-100">' +
          '<div class="menu-thumb-wrap mb-2" style="background-image:url(\'' + getMenuThumbnail(m) + '\')"></div>' +
          '<h5>' + m.nama + '</h5>' +
          '<p class="small text-muted">' + m.deskripsi + '</p>' +
          '<ul class="small">' +
            '<li>Kalori: ' + m.kalori + ' kkal</li>' +
            '<li>Protein: ' + m.protein + ' g</li>' +
            '<li>Karbo: ' + m.karbo + ' g</li>' +
            '<li>Lemak: ' + m.lemak + ' g</li>' +
          '</ul>' +
        '</div>' +
      '</div>';
    }
  });
  area.innerHTML = out;
  if(window.bootstrap){
    new bootstrap.Modal(document.getElementById('compareModal')).show();
  }
}
window.openCompareModal = openCompareModal;

// ============================================
// RANDOM MENU
// ============================================
function randomMenu(){
  var menu = MENU[Math.floor(Math.random() * MENU.length)];
  window.showToast('🎲 Coba: ' + menu.nama, 'info', 2000);
  setTimeout(function(){ window.location.href = 'detail.html?id=' + menu.id; }, 700);
}
window.randomMenu = randomMenu;

// ============================================
// FILTER ACTIONS
// ============================================
function applyFilterAction(){
  var searchEl = document.getElementById('filterSearch');
  var vegEl = document.getElementById('filterVeg');
  var katEl = document.getElementById('filterKategori');
  var minEl = document.getElementById('minKal');
  var maxEl = document.getElementById('maxKal');
  var sortEl = document.getElementById('sortBy');

  currentFilter.search = searchEl ? (searchEl.value || '') : '';
  currentFilter.veg = vegEl ? vegEl.checked : false;
  currentFilter.kategori = katEl ? (katEl.value || '') : '';
  currentFilter.minKal = minEl ? (parseInt(minEl.value || 0, 10) || 0) : 0;
  currentFilter.maxKal = maxEl ? (parseInt(maxEl.value || 0, 10) || 0) : 0;
  currentFilter.sort = sortEl ? (sortEl.value || 'skor') : 'skor';
  renderRecommendations();
}
window.applyFilterAction = applyFilterAction;

function clearFilterAction(){
  var s = document.getElementById('filterSearch'); if(s) s.value = '';
  var v = document.getElementById('filterVeg'); if(v) v.checked = false;
  var k = document.getElementById('filterKategori'); if(k) k.value = '';
  var mi = document.getElementById('minKal'); if(mi) mi.value = '';
  var ma = document.getElementById('maxKal'); if(ma) ma.value = '';
  var so = document.getElementById('sortBy'); if(so) so.value = 'skor';
  currentFilter = { search:'', veg:false, kategori:'', minKal:0, maxKal:0, sort:'skor' };
  renderRecommendations();
}
window.clearFilterAction = clearFilterAction;

function clearAllPlan(){
  localStorage.removeItem('mealPlan');
  openPlanModal();
  renderRecommendations();
}
window.clearAllPlan = clearAllPlan;

// ============================================
// INIT
// ============================================
function initRekomendasi(){
  console.log('🚀 Init rekomendasi...');
  renderGuidePreview();

  document.querySelectorAll('input[name="aiMode"]').forEach(function(radio){
    radio.addEventListener('change', function(e){
      if (e.target.checked) switchAIMode(e.target.value);
    });
  });

  renderRecommendations();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initRekomendasi);
} else {
  initRekomendasi();
}