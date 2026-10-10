// ============================================
// DETAIL RESEP — detail.js
// ============================================
var user = JSON.parse(localStorage.getItem('user'));
if (!user) window.location.href = 'index.html';

var params = new URLSearchParams(window.location.search);
var id = parseInt(params.get('id'));

var menu = MENU.find(function(m){ return m.id === id; });
var box = document.getElementById('detailBox');

if (!box) {
  console.error('❌ detailBox tidak ditemukan di HTML!');
} else if (!menu) {
  box.innerHTML = '<div class="alert alert-warning">Menu dengan ID ' + id + ' tidak ditemukan. <a href="rekomendasi.html">Kembali</a></div>';
} else {
  var thumb = window.generateMenuThumbnail ? window.generateMenuThumbnail(menu) : '';
  var bahanUserIds = JSON.parse(localStorage.getItem('bahanUser')) || [];

  var bahanList = menu.bahan.map(function(bid){
    var b = BAHAN.find(function(x){ return x.id === bid; });
    if (!b) return '';
    var tersedia = bahanUserIds.indexOf(bid) !== -1;
    var icon = tersedia ? '✅' : (bahanUserIds.length > 0 ? '❌' : '•');
    return '<li>' + icon + ' ' + b.nama + ' <small class="text-muted">(' + b.kalori + ' kkal/100g)</small></li>';
  }).join('');

  // Substitusi info
  var substitusiInfo = '';
  if (bahanUserIds.length > 0 && typeof SUBSTITUSI !== 'undefined') {
    menu.bahan.forEach(function(bid) {
      var bahan = BAHAN.find(function(x){ return x.id === bid; });
      if (!bahan) return;
      var tersedia = bahanUserIds.indexOf(bid) !== -1;
      var subs = (SUBSTITUSI[bid] || [])
        .filter(function(sid){ return bahanUserIds.indexOf(sid) !== -1; })
        .map(function(sid){ return BAHAN.find(function(b){ return b.id === sid; }); })
        .filter(Boolean);
      if (!tersedia && subs.length > 0) {
        substitusiInfo += '<div class="alert alert-warning py-2 small mb-2">' +
          '🔄 <b>' + bahan.nama + '</b> tidak tersedia. ' +
          'Pengganti: <b>' + subs.map(function(s){ return s.nama; }).join(', ') + '</b>' +
          '</div>';
      }
    });
  }

  var isSaved = window.isMenuSaved ? window.isMenuSaved(menu.id) : false;

  box.innerHTML =
    '<div class="d-flex gap-3 align-items-start mb-3 flex-wrap">' +
      '<a href="rekomendasi.html" class="btn btn-sm btn-outline-secondary">← Kembali</a>' +
      '<div class="ms-auto d-flex gap-2">' +
        '<button class="btn btn-sm btn-success share-btn">📱 Share</button>' +
        '<button class="btn btn-sm ' + (isSaved ? 'btn-secondary' : 'save-btn') + ' save-btn-detail" ' + (isSaved ? 'disabled' : '') + '>' +
          (isSaved ? '✓ Tersimpan' : 'Simpan ke Rencana') +
        '</button>' +
      '</div>' +
    '</div>' +
    '<div class="d-flex gap-4 align-items-start flex-wrap">' +
      '<img src="' + thumb + '" alt="thumb" style="width:200px;height:150px;border-radius:8px;object-fit:cover">' +
      '<div style="flex:1;min-width:250px">' +
        '<h2 style="margin:0">' + menu.nama + '</h2>' +
        '<p class="text-muted mb-1">' + menu.deskripsi + '</p>' +
        '<div class="mb-2">' +
          '<span class="badge-kalori">' + menu.kalori + ' kkal</span> ' +
          '<span class="badge bg-info text-dark">Protein: ' + menu.protein + 'g</span> ' +
          '<span class="badge bg-secondary">Karbo: ' + menu.karbo + 'g</span> ' +
          '<span class="badge bg-danger">Lemak: ' + menu.lemak + 'g</span> ' +
          '<span class="badge bg-light text-dark">⏱️ ' + (menu.waktu || '?') + ' menit</span>' +
          (menu.vegetarian ? ' <span class="badge bg-success">🌱 Vegetarian</span>' : '') +
        '</div>' +
      '</div>' +
    '</div>' +
    '<hr />' +
    '<h5>🧺 Bahan-bahan:</h5><ul>' + bahanList + '</ul>' + substitusiInfo +
    '<h5>👩‍🍳 Cara Membuat:</h5><ol>' +
      menu.caraMasak.split('\n').map(function(s){
        return '<li style="margin-bottom:6px">' + s.replace(/^\d+\.\s*/, '') + '</li>';
      }).join('') +
    '</ol>' +
    '<hr />' +
    '<h5>📊 Komposisi Gizi</h5>' +
    '<canvas id="nutriChart" style="max-width:480px;max-height:320px"></canvas>';

  var saveBtn = box.querySelector('.save-btn-detail');
  if(saveBtn){
    saveBtn.addEventListener('click', function(){
      if(window.saveMenu){
        window.saveMenu(menu.id, menu.nama);
        setTimeout(function(){ window.location.reload(); }, 700);
      }
    });
  }

  var shareBtn = box.querySelector('.share-btn');
  if(shareBtn){
    shareBtn.addEventListener('click', function(){
      var text = 'Cek menu diet: ' + menu.nama + ' — ' + menu.kalori + ' kkal!';
      var url = 'https://wa.me/?text=' + encodeURIComponent(text + ' ' + location.href);
      window.open(url, '_blank');
    });
  }

  var ctx = document.getElementById('nutriChart');
  if(ctx && window.Chart){
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Protein (g)', 'Karbo (g)', 'Lemak (g)'],
        datasets: [{
          label: 'Nilai gizi',
          data: [menu.protein, menu.karbo, menu.lemak],
          backgroundColor: ['#4da6ff', '#ffd66b', '#ff9a9a']
        }]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
    });
  }
}