// ============================================
// BAHAN.JS
// Logika halaman "Pilih Bahan"
// ============================================

var user = JSON.parse(localStorage.getItem('user'));
if (!user) window.location.href = 'index.html';

// Tampilkan info user
document.getElementById('infoUser').innerHTML =
  'Halo <b>' + user.nama + '</b>! Target kalori kamu: <span class="badge-kalori">' + user.target + ' kkal/hari</span>';

// Label kategori
var kategoriLabel = {
  protein: '🥩 Protein',
  karbo:   '🍚 Karbohidrat',
  sayur:   '🥬 Sayuran',
  buah:    '🍎 Buah',
  lain:    '🧂 Lainnya'
};

var listBahanEl = document.getElementById('listBahan');
var kategoriGroup = {};

// Kelompokkan bahan per kategori
BAHAN.forEach(function(b){
  if (!kategoriGroup[b.kategori]) kategoriGroup[b.kategori] = [];
  kategoriGroup[b.kategori].push(b);
});

// Render HTML
var html = '';
for (var kat in kategoriGroup) {
  html += '<h5 class="mt-3">' + kategoriLabel[kat] + '</h5><div class="row">';
  kategoriGroup[kat].forEach(function(b){
    html += '<div class="col-md-3 mb-2"><div class="form-check">' +
      '<input class="form-check-input" type="checkbox" name="bahan" value="' + b.id + '" id="b' + b.id + '">' +
      '<label class="form-check-label" for="b' + b.id + '">' + b.nama +
      ' <small class="text-muted">(' + b.kalori + ' kkal/100g)</small></label></div></div>';
  });
  html += '</div>';
}
listBahanEl.innerHTML = html;

// Load bahan yang sudah pernah dipilih
var saved = JSON.parse(localStorage.getItem('bahanUser')) || [];
saved.forEach(function(id){
  var cb = document.getElementById('b' + id);
  if(cb) cb.checked = true;
});

// Search bahan
var searchInput = document.getElementById('searchBahan');
if(searchInput){
  searchInput.addEventListener('input', function(){
    var q = searchInput.value.toLowerCase();
    document.querySelectorAll('#listBahan label').forEach(function(lb){
      var txt = lb.textContent.toLowerCase();
      lb.closest('.col-md-3').style.display = txt.includes(q) ? '' : 'none';
    });
  });
}

// Tombol Pilih Semua
document.getElementById('selectAllBtn').addEventListener('click', function(e){
  e.preventDefault();
  document.querySelectorAll('#listBahan input[type="checkbox"]').forEach(function(cb){ cb.checked = true; });
  window.showToast('Semua bahan dipilih', 'success', 1400);
});

// Tombol Bersihkan
document.getElementById('clearBtn').addEventListener('click', function(e){
  e.preventDefault();
  document.querySelectorAll('#listBahan input[type="checkbox"]').forEach(function(cb){ cb.checked = false; });
  window.showToast('Pilihan dibersihkan', 'info', 1200);
});

// Submit form
document.getElementById('formBahan').addEventListener('submit', function(e){
  e.preventDefault();
  var checked = Array.from(document.querySelectorAll('input[name="bahan"]:checked'))
    .map(function(el){ return parseInt(el.value); });
  if (checked.length === 0) {
    window.showToast('Pilih minimal 1 bahan!', 'warning', 1600);
    return;
  }
  localStorage.setItem('bahanUser', JSON.stringify(checked));
  window.location.href = 'rekomendasi.html';
});