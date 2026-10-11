// ============================================
// APP.JS — Logika halaman index.html
// ============================================

// Cek: apakah user sudah pernah isi profil?
// Kalau belum, tetap di halaman ini.

// 1. Tampilkan tahun di footer
var footerYear = document.getElementById('footerYear');
if (footerYear) footerYear.textContent = new Date().getFullYear();

// 2. Tombol Dark Mode (🌙)
var darkToggle = document.getElementById('darkToggle');
if (darkToggle) {
  // Load preferensi tersimpan
  if (localStorage.getItem('darkMode') === 'on') {
    document.body.classList.add('dark-mode');
    darkToggle.textContent = '☀️';
  }

  darkToggle.addEventListener('click', function () {
    document.body.classList.toggle('dark-mode');
    var isDark = document.body.classList.contains('dark-mode');
    darkToggle.textContent = isDark ? '☀️' : '🌙';
    localStorage.setItem('darkMode', isDark ? 'on' : 'off');
  });
}

// 3. Form Profil — hitung kalori & simpan
var formProfil = document.getElementById('formProfil');
if (formProfil) {
  formProfil.addEventListener('submit', function (e) {
    e.preventDefault();

    var nama     = document.getElementById('nama').value.trim();
    var umur     = parseFloat(document.getElementById('umur').value);
    var jk       = document.getElementById('jk').value;
    var berat    = parseFloat(document.getElementById('berat').value);
    var tinggi   = parseFloat(document.getElementById('tinggi').value);
    var aktivitas= document.getElementById('aktivitas').value;
    var tujuan   = document.getElementById('tujuan').value;
    var alergi   = document.getElementById('alergi').value.trim();

    // Validasi
    if (!nama || !umur || !berat || !tinggi) {
      alert('Mohon isi Nama, Umur, Berat, dan Tinggi!');
      return;
    }

    // Hitung BMR (Mifflin-St Jeor)
    var bmr;
    if (jk === 'L') {
      bmr = 10 * berat + 6.25 * tinggi - 5 * umur + 5;
    } else {
      bmr = 10 * berat + 6.25 * tinggi - 5 * umur - 161;
    }

    // Faktor aktivitas
    var faktor = {
      'rendah': 1.2,
      'ringan': 1.375,
      'sedang': 1.55,
      'berat': 1.725
    };
    var tdee = bmr * (faktor[aktivitas] || 1.2);

    // Sesuaikan dengan tujuan
    var target;
    if (tujuan === 'turun')      target = tdee - 500;
    else if (tujuan === 'naik')  target = tdee + 500;
    else                         target = tdee;

    target = Math.round(target);

    // Simpan ke localStorage
    // ⚠️ PENTING: pakai key 'user' (sama seperti bahan.js)
    var userData = {
      nama: nama,
      umur: umur,
      jk: jk,
      berat: berat,
      tinggi: tinggi,
      aktivitas: aktivitas,
      tujuan: tujuan,
      alergi: alergi,
      target: target,        // <- dipakai oleh bahan.js
      targetKalori: target   // <- dipakai oleh ai.js
    };
    localStorage.setItem('user', JSON.stringify(userData));

    // Lanjut ke halaman pilih bahan
    window.location.href = 'bahan.html';
  });
}

// 4. Tombol Demo — isi contoh otomatis
var demoBtn = document.getElementById('demoBtn');
if (demoBtn) {
  demoBtn.addEventListener('click', function () {
    document.getElementById('nama').value = 'Budi';
    document.getElementById('umur').value = 25;
    document.getElementById('jk').value = 'L';
    document.getElementById('berat').value = 70;
    document.getElementById('tinggi').value = 170;
    document.getElementById('aktivitas').value = 'sedang';
    document.getElementById('tujuan').value = 'turun';
    document.getElementById('alergi').value = '';
  });
}

console.log('✅ app.js loaded for index.html');
