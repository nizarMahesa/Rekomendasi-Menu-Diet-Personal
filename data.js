// ============================================
// DATA BAHAN (dari Kaggle: InDiet + MISKG)
// ============================================
const BAHAN = [
  // ===== PROTEIN HEWANI =====
  { id: 1,  nama: "Telur",               kategori: "protein", kalori: 155, protein: 13,   karbo: 1.1, lemak: 11 },
  { id: 2,  nama: "Ayam Dada",          kategori: "protein", kalori: 165, protein: 31,   karbo: 0,   lemak: 3.6 },
  { id: 3,  nama: "Tahu",                kategori: "protein", kalori: 76,  protein: 8,    karbo: 1.9, lemak: 4.8 },
  { id: 4,  nama: "Tempe",               kategori: "protein", kalori: 193, protein: 19,   karbo: 9,   lemak: 11 },
  { id: 5,  nama: "Ikan Salmon",        kategori: "protein", kalori: 208, protein: 20,   karbo: 0,   lemak: 13 },
  { id: 6,  nama: "Daging Sapi",        kategori: "protein", kalori: 250, protein: 26,   karbo: 0,   lemak: 15 },
  { id: 27, nama: "Ikan Kembung",       kategori: "protein", kalori: 103, protein: 22,   karbo: 0,   lemak: 1.5 },
  { id: 28, nama: "Udang",              kategori: "protein", kalori: 99,  protein: 24,   karbo: 0.2, lemak: 0.3 },
  { id: 29, nama: "Cumi-cumi",          kategori: "protein", kalori: 92,  protein: 15.6, karbo: 3.1, lemak: 1.4 },
  { id: 30, nama: "Edamame",            kategori: "protein", kalori: 121, protein: 11,   karbo: 9,   lemak: 5 },
  { id: 31, nama: "Yogurt Plain",       kategori: "protein", kalori: 59,  protein: 10,   karbo: 3.6, lemak: 0.4 },
  { id: 32, nama: "Kacang Merah",       kategori: "protein", kalori: 127, protein: 8.7,  karbo: 22,  lemak: 0.5 },
  { id: 33, nama: "Kacang Tanah",       kategori: "protein", kalori: 567, protein: 26,   karbo: 16,  lemak: 49 },

  // ===== KARBOHIDRAT =====
  { id: 7,  nama: "Beras Merah",        kategori: "karbo",   kalori: 111, protein: 2.6,  karbo: 23,  lemak: 0.9 },
  { id: 8,  nama: "Beras Putih",        kategori: "karbo",   kalori: 130, protein: 2.7,  karbo: 28,  lemak: 0.3 },
  { id: 9,  nama: "Oat",                kategori: "karbo",   kalori: 389, protein: 16.9, karbo: 66,  lemak: 6.9 },
  { id: 10, nama: "Roti Gandum",        kategori: "karbo",   kalori: 247, protein: 13,   karbo: 41,  lemak: 4.2 },
  { id: 11, nama: "Kentang",            kategori: "karbo",   kalori: 77,  protein: 2,    karbo: 17,  lemak: 0.1 },
  { id: 12, nama: "Jagung",             kategori: "karbo",   kalori: 86,  protein: 3.2,  karbo: 19,  lemak: 1.2 },
  { id: 34, nama: "Ubi Jalar",          kategori: "karbo",   kalori: 86,  protein: 1.6,  karbo: 20,  lemak: 0.1 },
  { id: 35, nama: "Quinoa",             kategori: "karbo",   kalori: 120, protein: 4.4,  karbo: 21,  lemak: 1.9 },
  { id: 36, nama: "Bihun",              kategori: "karbo",   kalori: 109, protein: 0.9,  karbo: 25,  lemak: 0.1 },
  { id: 37, nama: "Mie Telur",          kategori: "karbo",   kalori: 138, protein: 4.5,  karbo: 25,  lemak: 2.1 },
  { id: 38, nama: "Lontong",            kategori: "karbo",   kalori: 130, protein: 2.4,  karbo: 28,  lemak: 0.3 },

  // ===== SAYURAN =====
  { id: 13, nama: "Bayam",              kategori: "sayur",   kalori: 23,  protein: 2.9,  karbo: 3.6, lemak: 0.4 },
  { id: 14, nama: "Brokoli",            kategori: "sayur",   kalori: 34,  protein: 2.8,  karbo: 7,   lemak: 0.4 },
  { id: 15, nama: "Wortel",              kategori: "sayur",   kalori: 41,  protein: 0.9,  karbo: 10,  lemak: 0.2 },
  { id: 16, nama: "Tomat",              kategori: "sayur",   kalori: 18,  protein: 0.9,  karbo: 3.9, lemak: 0.2 },
  { id: 17, nama: "Kangkung",           kategori: "sayur",   kalori: 19,  protein: 3.4,  karbo: 3.1, lemak: 0.2 },
  { id: 18, nama: "Buncis",             kategori: "sayur",   kalori: 31,  protein: 1.8,  karbo: 7,   lemak: 0.1 },
  { id: 39, nama: "Sawi Hijau",         kategori: "sayur",   kalori: 15,  protein: 1.5,  karbo: 2.7, lemak: 0.2 },
  { id: 40, nama: "Pak Choy",           kategori: "sayur",   kalori: 13,  protein: 1.5,  karbo: 2.2, lemak: 0.2 },
  { id: 41, nama: "Kubis",              kategori: "sayur",   kalori: 25,  protein: 1.3,  karbo: 5.8, lemak: 0.1 },
  { id: 42, nama: "Timun",              kategori: "sayur",   kalori: 15,  protein: 0.7,  karbo: 3.6, lemak: 0.1 },
  { id: 43, nama: "Jamur",              kategori: "sayur",   kalori: 22,  protein: 3.1,  karbo: 3.3, lemak: 0.3 },
  { id: 44, nama: "Selada",             kategori: "sayur",   kalori: 15,  protein: 1.4,  karbo: 2.9, lemak: 0.2 },
  { id: 45, nama: "Asparagus",          kategori: "sayur",   kalori: 20,  protein: 2.2,  karbo: 3.9, lemak: 0.1 },
  { id: 46, nama: "Daun Kemangi",       kategori: "sayur",   kalori: 23,  protein: 3.2,  karbo: 2.6, lemak: 0.6 },
  { id: 47, nama: "Tauge",              kategori: "sayur",   kalori: 30,  protein: 3,    karbo: 5.9, lemak: 0.2 },

  // ===== BUAH =====
  { id: 19, nama: "Pisang",             kategori: "buah",    kalori: 89,  protein: 1.1,  karbo: 23,  lemak: 0.3 },
  { id: 20, nama: "Apel",               kategori: "buah",    kalori: 52,  protein: 0.3,  karbo: 14,  lemak: 0.2 },
  { id: 21, nama: "Alpukat",            kategori: "buah",    kalori: 160, protein: 2,    karbo: 9,   lemak: 15 },
  { id: 22, nama: "Jeruk",              kategori: "buah",    kalori: 47,  protein: 0.9,  karbo: 12,  lemak: 0.1 },
  { id: 48, nama: "Pepaya",             kategori: "buah",    kalori: 43,  protein: 0.5,  karbo: 11,  lemak: 0.3 },
  { id: 49, nama: "Mangga",             kategori: "buah",    kalori: 60,  protein: 0.8,  karbo: 15,  lemak: 0.4 },
  { id: 50, nama: "Semangka",           kategori: "buah",    kalori: 30,  protein: 0.6,  karbo: 8,   lemak: 0.2 },
  { id: 51, nama: "Melon",              kategori: "buah",    kalori: 34,  protein: 0.8,  karbo: 8,   lemak: 0.2 },
  { id: 52, nama: "Jambu Biji",         kategori: "buah",    kalori: 68,  protein: 2.6,  karbo: 14,  lemak: 1 },
  { id: 53, nama: "Kiwi",               kategori: "buah",    kalori: 61,  protein: 1.1,  karbo: 15,  lemak: 0.5 },
  { id: 54, nama: "Buah Naga",          kategori: "buah",    kalori: 60,  protein: 1.2,  karbo: 13,  lemak: 0.4 },
  { id: 55, nama: "Pir",                kategori: "buah",    kalori: 57,  protein: 0.4,  karbo: 15,  lemak: 0.1 },

  // ===== LAINNYA =====
  { id: 23, nama: "Susu Rendah Lemak",  kategori: "lain",    kalori: 42,  protein: 3.4,  karbo: 5,   lemak: 1 },
  { id: 24, nama: "Minyak Zaitun",     kategori: "lain",    kalori: 884, protein: 0,    karbo: 0,   lemak: 100 },
  { id: 25, nama: "Bawang Merah",       kategori: "lain",    kalori: 40,  protein: 1.1,  karbo: 9,   lemak: 0.1 },
  { id: 26, nama: "Bawang Putih",       kategori: "lain",    kalori: 149, protein: 6.4,  karbo: 33,  lemak: 0.5 },
  { id: 56, nama: "Kecap Manis",        kategori: "lain",    kalori: 46,  protein: 5.7,  karbo: 9,   lemak: 1.3 },
  { id: 57, nama: "Saus Tiram",         kategori: "lain",    kalori: 51,  protein: 1.4,  karbo: 11,  lemak: 0.2 },
  { id: 58, nama: "Madu",               kategori: "lain",    kalori: 304, protein: 0.3,  karbo: 82,  lemak: 0 },
  { id: 59, nama: "Selai Kacang",       kategori: "lain",    kalori: 588, protein: 25,   karbo: 20,  lemak: 50 },
  { id: 60, nama: "Cokelat Hitam",      kategori: "lain",    kalori: 546, protein: 4.9,  karbo: 61,  lemak: 31 },
  { id: 61, nama: "Almond",             kategori: "lain",    kalori: 579, protein: 21,   karbo: 22,  lemak: 50 },
  { id: 62, nama: "Walnut",             kategori: "lain",    kalori: 654, protein: 15,   karbo: 14,  lemak: 65 },
  { id: 63, nama: "Biji Chia",          kategori: "lain",    kalori: 486, protein: 17,   karbo: 42,  lemak: 31 },
  { id: 64, nama: "Granola",            kategori: "lain",    kalori: 471, protein: 10,   karbo: 64,  lemak: 20 },
  { id: 65, nama: "Kunyit",             kategori: "lain",    kalori: 354, protein: 8,    karbo: 65,  lemak: 10 },
  { id: 66, nama: "Serai",              kategori: "lain",    kalori: 99,  protein: 1.8,  karbo: 25,  lemak: 0.5 },
  { id: 67, nama: "Cabai Merah",        kategori: "lain",    kalori: 40,  protein: 1.9,  karbo: 8.8, lemak: 0.4 },
  { id: 68, nama: "Daun Pisang",        kategori: "lain",    kalori: 0,   protein: 0,    karbo: 0,   lemak: 0 },
  { id: 69, nama: "Soun",               kategori: "lain",    kalori: 109, protein: 0.9,  karbo: 25,  lemak: 0.1 },
  { id: 70, nama: "Seledri",            kategori: "lain",    kalori: 16,  protein: 0.7,  karbo: 3,   lemak: 0.2 }
];

// ============================================
// DATA MENU (SEMUA FOTO SUDAH TERISI LINK)
// ============================================
const MENU = [
  // ===== SARAPAN =====
  { 
    id: 1, 
    nama: "Omelet Sayur + Roti Gandum", 
    deskripsi: "Sarapan tinggi protein dan serat", 
    kalori: 380, protein: 20, karbo: 40, lemak: 12, 
    kategori: "sarapan", vegetarian: true, waktu: 10, 
    foto: "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=300&auto=format&fit=crop&q=80",
    caraMasak: "1. Kocok telur\n2. Tambah tomat & wortel cincang\n3. Dadar hingga matang\n4. Sajikan dengan roti gandum.", 
    bahan: [1, 16, 15, 10] 
  },
  { 
    id: 2, 
    nama: "Smoothie Pisang Oat", 
    deskripsi: "Snack sehat tinggi serat", 
    kalori: 250, protein: 8, karbo: 45, lemak: 5, 
    kategori: "snack", vegetarian: true, waktu: 5, 
    foto: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=300&auto=format&fit=crop&q=80",
    caraMasak: "1. Blender pisang + oat + susu\n2. Tambah es batu\n3. Sajikan dingin.", 
    bahan: [19, 9, 23] 
  },
  { 
    id: 3, 
    nama: "Salad Alpukat Telur", 
    deskripsi: "Salad segar tinggi lemak sehat", 
    kalori: 320, protein: 15, karbo: 15, lemak: 22, 
    kategori: "sarapan", vegetarian: true, waktu: 10, 
    foto: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300&auto=format&fit=crop&q=80",
    caraMasak: "1. Potong alpukat & telur rebus\n2. Tambah tomat\n3. Beri minyak zaitun & garam.", 
    bahan: [21, 1, 16, 24] 
  },
  { 
    id: 4, 
    nama: "Oatmeal Pisang Alpukat", 
    deskripsi: "Sarapan energi tinggi", 
    kalori: 400, protein: 12, karbo: 55, lemak: 15, 
    kategori: "sarapan", vegetarian: true, waktu: 7, 
    foto: "https://images.unsplash.com/photo-1517673400267-0251440c45dc?w=300&auto=format&fit=crop&q=80", 
    caraMasak: "1. Seduh oat dengan susu panas\n2. Tambah irisan pisang & alpukat\n3. Sajikan.", 
    bahan: [9, 19, 21] 
  },
  { 
    id: 5, 
    nama: "Smoothie Bowl Buah Naga", 
    deskripsi: "Sarapan segar kaya antioksidan", 
    kalori: 270, protein: 8, karbo: 48, lemak: 6, 
    kategori: "sarapan", vegetarian: true, waktu: 8, 
    foto: "https://images.unsplash.com/photo-1590301157890-4810ed352733?w=300&auto=format&fit=crop&q=80", 
    caraMasak: "1. Blender buah naga + yogurt\n2. Tuang ke mangkuk\n3. Taburi granola & chia seed.", 
    bahan: [54, 31, 64, 63] 
  },
  { 
    id: 6, 
    nama: "Roti Gandum Selai Kacang + Pisang", 
    deskripsi: "Sarapan praktis tinggi energi", 
    kalori: 420, protein: 14, karbo: 50, lemak: 18, 
    kategori: "sarapan", vegetarian: true, waktu: 5, 
    foto: "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=300&auto=format&fit=crop&q=80", 
    caraMasak: "1. Panggang roti gandum\n2. Olesi selai kacang\n3. Tambah irisan pisang\n4. Sajikan.", 
    bahan: [10, 59, 19] 
  },
  { 
    id: 7, 
    nama: "Yogurt Buah + Granola", 
    deskripsi: "Sarapan ringan kaya probiotik", 
    kalori: 310, protein: 12, karbo: 42, lemak: 10, 
    kategori: "sarapan", vegetarian: true, waktu: 5, 
    foto: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=300&auto=format&fit=crop&q=80", 
    caraMasak: "1. Tuang yogurt ke mangkuk\n2. Tambah potongan buah\n3. Taburi granola.", 
    bahan: [31, 48, 64, 53] 
  },

  // ===== MAKAN SIANG =====
  { 
    id: 8, 
    nama: "Tumis Tahu Bayam + Nasi Merah", 
    deskripsi: "Menu seimbang protein nabati dan sayur hijau", 
    kalori: 420, protein: 18, karbo: 55, lemak: 14, 
    kategori: "makan_siang", vegetarian: true, waktu: 15, 
    foto: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=300&auto=format&fit=crop&q=80", 
    caraMasak: "1. Tumis bawang hingga harum\n2. Masukkan tahu, aduk rata\n3. Tambah bayam, masak sebentar\n4. Sajikan dengan nasi merah.", 
    bahan: [3, 13, 25, 7] 
  },
  { 
    id: 9, 
    nama: "Nasi Merah + Tempe Bacem + Kangkung", 
    deskripsi: "Menu tradisional sehat", 
    kalori: 450, protein: 22, karbo: 60, lemak: 12, 
    kategori: "makan_siang", vegetarian: true, waktu: 25, 
    foto: "https://media.istockphoto.com/id/1453228857/id/foto/nasi-merah-dengan-sayuran-dan-tempe-di-atas-piring-makanan-sehat.jpg?s=612x612&w=0&k=20&c=gnTzsE0gOpJKKaFiE6Mm2vx_xnfymdmbuOwfmYKxzpU=", 
    caraMasak: "1. Bacem tempe dengan kecap\n2. Tumis kangkung dengan bawang\n3. Sajikan dengan nasi merah.", 
    bahan: [7, 4, 17, 26] 
  },
  { 
    id: 10, 
    nama: "Kentang Rebus + Telur + Buncis", 
    deskripsi: "Menu simpel kaya protein", 
    kalori: 340, protein: 18, karbo: 40, lemak: 10, 
    kategori: "makan_siang", vegetarian: true, waktu: 20, 
    foto: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&auto=format&fit=crop&q=80", 
    caraMasak: "1. Rebus kentang 15 menit\n2. Rebus telur 8 menit\n3. Tumis buncis\n4. Sajikan.", 
    bahan: [11, 1, 18] 
  },
  { 
    id: 11, 
    nama: "Gado-Gado", 
    deskripsi: "Salad sayur dengan saus kacang, khas Indonesia", 
    kalori: 380, protein: 15, karbo: 42, lemak: 16, 
    kategori: "makan_siang", vegetarian: true, waktu: 20, 
    foto: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300&auto=format&fit=crop&q=80", 
    caraMasak: "1. Rebus semua sayur\n2. Haluskan kacang tanah + bawang\n3. Campur sayur dengan saus kacang\n4. Tambah lontong.", 
    bahan: [33, 3, 4, 17, 47, 38] 
  },
  { 
    id: 12, 
    nama: "Nasi Ayam Bakar Tempe", 
    deskripsi: "Menu lengkap protein hewani & nabati", 
    kalori: 520, protein: 32, karbo: 58, lemak: 14, 
    kategori: "makan_siang", vegetarian: false, waktu: 30, 
    foto: "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=300&auto=format&fit=crop&q=80", 
    caraMasak: "1. Marinasi ayam dengan kecap & bawang\n2. Bakar ayam hingga matang\n3. Goreng tempe sebentar\n4. Sajikan dengan nasi.", 
    bahan: [2, 4, 8, 56, 26] 
  },
  { 
    id: 13, 
    nama: "Tumis Kangkung Tahu + Nasi", 
    deskripsi: "Menu vegetarian rendah kalori", 
    kalori: 320, protein: 14, karbo: 42, lemak: 10, 
    kategori: "makan_siang", vegetarian: true, waktu: 15, 
    foto: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=300&auto=format&fit=crop&q=80", 
    caraMasak: "1. Tumis bawang putih\n2. Masukkan tahu, aduk\n3. Tambah kangkung & saus tiram\n4. Sajikan dengan nasi.", 
    bahan: [17, 3, 26, 57, 8] 
  },
  { 
    id: 14, 
    nama: "Pecel Sayur + Nasi Merah", 
    deskripsi: "Sayuran segar dengan saus kacang", 
    kalori: 360, protein: 12, karbo: 48, lemak: 14, 
    kategori: "makan_siang", vegetarian: true, waktu: 20, 
    foto: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300&auto=format&fit=crop&q=80", 
    caraMasak: "1. Rebus sayuran\n2. Haluskan kacang + cabai + bawang\n3. Siram sayur dengan saus\n4. Sajikan dengan nasi merah.", 
    bahan: [33, 13, 47, 18, 7] 
  },
  { 
    id: 15, 
    nama: "Nasi + Ikan Kembung Goreng + Lalapan", 
    deskripsi: "Menu tinggi omega-3", 
    kalori: 480, protein: 28, karbo: 52, lemak: 18, 
    kategori: "makan_siang", vegetarian: false, waktu: 20, 
    foto: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=300&auto=format&fit=crop&q=80", 
    caraMasak: "1. Lumuri ikan dengan bumbu\n2. Goreng hingga matang\n3. Siapkan lalapan timun & kemangi\n4. Sajikan dengan nasi.", 
    bahan: [27, 8, 42, 46, 67] 
  },

  // ===== MAKAN MALAM =====
  { 
    id: 16, 
    nama: "Sup Ayam Jagung Wortel", 
    deskripsi: "Sup hangat rendah kalori", 
    kalori: 280, protein: 25, karbo: 30, lemak: 6, 
    kategori: "makan_malam", vegetarian: false, waktu: 30, 
    foto: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=300&auto=format&fit=crop&q=80", 
    caraMasak: "1. Rebus ayam hingga empuk\n2. Tambah jagung & wortel\n3. Bumbui garam & merica\n4. Sajikan hangat.", 
    bahan: [2, 12, 15, 26] 
  },
  { 
    id: 17, 
    nama: "Ayam Panggang Brokoli", 
    deskripsi: "Menu tinggi protein rendah karbo", 
    kalori: 380, protein: 40, karbo: 12, lemak: 18, 
    kategori: "makan_malam", vegetarian: false, waktu: 25, 
    foto: "https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=300&auto=format&fit=crop&q=80", 
    caraMasak: "1. Marinasi ayam dengan bawang\n2. Panggang 20 menit\n3. Kukus brokoli\n4. Sajikan.", 
    bahan: [2, 14, 24] 
  },
  { 
    id: 18, 
    nama: "Sup Ikan Salmon Tomat", 
    deskripsi: "Menu omega-3 untuk kesehatan jantung", 
    kalori: 350, protein: 30, karbo: 12, lemak: 20, 
    kategori: "makan_malam", vegetarian: false, waktu: 20, 
    foto: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=300&auto=format&fit=crop&q=80", 
    caraMasak: "1. Tumis tomat & bawang\n2. Tambah air, didihkan\n3. Masukkan salmon\n4. Sajikan hangat.", 
    bahan: [5, 16, 25] 
  },
  { 
    id: 19, 
    nama: "Soto Ayam Bening", 
    deskripsi: "Sup ayam khas Indonesia, rendah lemak", 
    kalori: 280, protein: 24, karbo: 18, lemak: 10, 
    kategori: "makan_malam", vegetarian: false, waktu: 35, 
    foto: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=300&auto=format&fit=crop&q=80", 
    caraMasak: "1. Rebus ayam dengan kunyit & serai\n2. Tambah kol & soun\n3. Bumbui garam\n4. Sajikan dengan bawang goreng.", 
    bahan: [2, 65, 66, 25, 41, 69] 
  },
  { 
    id: 20, 
    nama: "Pepes Ikan Kembung", 
    deskripsi: "Ikan kukus bumbu kemangi, rendah kalori", 
    kalori: 240, protein: 28, karbo: 6, lemak: 11, 
    kategori: "makan_malam", vegetarian: false, waktu: 25, 
    foto: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=300&auto=format&fit=crop&q=80", 
    caraMasak: "1. Lumuri ikan dengan bumbu\n2. Bungkus dengan daun pisang\n3. Kukus 20 menit\n4. Sajikan.", 
    bahan: [27, 46, 16, 67, 68] 
  },
  { 
    id: 21, 
    nama: "Sup Bening Sayur + Dada Ayam", 
    deskripsi: "Sup rendah lemak tinggi protein", 
    kalori: 210, protein: 26, karbo: 14, lemak: 5, 
    kategori: "makan_malam", vegetarian: false, waktu: 25, 
    foto: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=300&auto=format&fit=crop&q=80", 
    caraMasak: "1. Rebus dada ayam\n2. Tambah wortel, buncis, kentang\n3. Bumbui seledri & garam\n4. Sajikan hangat.", 
    bahan: [2, 15, 18, 11, 70] 
  },
  { 
    id: 22, 
    nama: "Tumis Brokoli Sapi", 
    deskripsi: "Menu tinggi protein & zat besi", 
    kalori: 360, protein: 30, karbo: 15, lemak: 20, 
    kategori: "makan_malam", vegetarian: false, waktu: 20, 
    foto: "https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=300&auto=format&fit=crop&q=80", 
    caraMasak: "1. Tumis bawang & sapi\n2. Tambah brokoli\n3. Bumbui saus tiram\n4. Sajikan.", 
    bahan: [6, 14, 26, 57] 
  },
  { 
    id: 23, 
    nama: "Capcay Kuah + Nasi Merah", 
    deskripsi: "Menu sayur lengkap dengan kuah", 
    kalori: 340, protein: 16, karbo: 48, lemak: 10, 
    kategori: "makan_malam", vegetarian: true, waktu: 20, 
    foto: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=300&auto=format&fit=crop&q=80", 
    caraMasak: "1. Tumis bawang\n2. Masukkan semua sayur\n3. Tambah air & saus tiram\n4. Sajikan dengan nasi merah.", 
    bahan: [15, 14, 41, 43, 57, 7] 
  },
  { 
    id: 24, 
    nama: "Tumis Udang Brokoli", 
    deskripsi: "Menu laut tinggi protein rendah lemak", 
    kalori: 290, protein: 28, karbo: 12, lemak: 14, 
    kategori: "makan_malam", vegetarian: false, waktu: 15, 
    foto: "https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=300&auto=format&fit=crop&q=80", 
    caraMasak: "1. Tumis bawang putih\n2. Masukkan udang\n3. Tambah brokoli\n4. Bumbui garam & saus tiram.", 
    bahan: [28, 14, 26, 57] 
  },

  // ===== SNACK =====
  { 
    id: 25, 
    nama: "Salad Buah Yogurt", 
    deskripsi: "Snack segar rendah kalori", 
    kalori: 180, protein: 6, karbo: 30, lemak: 4, 
    kategori: "snack", vegetarian: true, waktu: 5, 
    foto: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=300&auto=format&fit=crop&q=80", 
    caraMasak: "1. Potong semua buah\n2. Campur dalam mangkuk\n3. Siram dengan yogurt.", 
    bahan: [20, 22, 48, 31] 
  },
  { 
    id: 26, 
    nama: "Almond + Cokelat Hitam", 
    deskripsi: "Snack tinggi lemak sehat", 
    kalori: 220, protein: 6, karbo: 15, lemak: 16, 
    kategori: "snack", vegetarian: true, waktu: 2, 
    foto: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300&auto=format&fit=crop&q=80", 
    caraMasak: "1. Siapkan almond\n2. Potong cokelat hitam\n3. Sajikan bersama.", 
    bahan: [61, 60] 
  },
  { 
    id: 27, 
    nama: "Edamame Rebus", 
    deskripsi: "Snack protein nabati", 
    kalori: 150, protein: 12, karbo: 10, lemak: 6, 
    kategori: "snack", vegetarian: true, waktu: 8, 
    foto: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=300&auto=format&fit=crop&q=80", 
    caraMasak: "1. Rebus edamame 5 menit\n2. Taburi garam\n3. Sajikan hangat.", 
    bahan: [30] 
  },
  { 
    id: 28, 
    nama: "Pisang + Selai Kacang", 
    deskripsi: "Snack energi cepat", 
    kalori: 250, protein: 8, karbo: 32, lemak: 12, 
    kategori: "snack", vegetarian: true, waktu: 3, 
    foto: "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=300&auto=format&fit=crop&q=80", 
    caraMasak: "1. Potong pisang\n2. Olesi selai kacang\n3. Sajikan.", 
    bahan: [19, 59] 
  },
  { 
    id: 29, 
    nama: "Yogurt Madu + Chia", 
    deskripsi: "Snack probiotik tinggi serat", 
    kalori: 190, protein: 10, karbo: 22, lemak: 8, 
    kategori: "snack", vegetarian: true, waktu: 3, 
    foto: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=300&auto=format&fit=crop&q=80", 
    caraMasak: "1. Tuang yogurt\n2. Tambah madu\n3. Taburi chia seed.", 
    bahan: [31, 58, 63] 
  },
  { 
    id: 30, 
    nama: "Buah Potong Segar", 
    deskripsi: "Snack buah campur", 
    kalori: 120, protein: 2, karbo: 30, lemak: 0.5, 
    kategori: "snack", vegetarian: true, waktu: 5, 
    foto: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=300&auto=format&fit=crop&q=80", 
    caraMasak: "1. Potong semua buah\n2. Tata di piring\n3. Sajikan dingin.", 
    bahan: [19, 50, 51, 53] 
  }
];

// ============================================
// DATA SUBSTITUSI BAHAN (dari Kaggle: MISKG Dataset)
// ============================================
const SUBSTITUSI = {
  // Protein hewani
  1:  [4, 3, 30],
  2:  [6, 27, 28, 29],
  5:  [27, 28, 2],
  6:  [2, 27, 32],
  27: [5, 28, 29],
  28: [29, 27, 2],
  29: [28, 27, 5],
  // Protein nabati
  3:  [4, 1, 30, 32],
  4:  [3, 1, 30, 32],
  30: [4, 3, 32],
  31: [23, 58],
  32: [4, 3, 30],
  33: [61, 62, 59],
  61: [62, 33, 59],
  62: [61, 33, 59],
  // Karbohidrat
  7:  [8, 34, 35, 38],
  8:  [7, 38, 11],
  9:  [35, 7, 10],
  10: [9, 36, 35],
  11: [34, 12, 38],
  12: [11, 34, 7],
  34: [11, 12, 7],
  35: [9, 7, 10],
  36: [37, 69, 7],
  37: [36, 69],
  38: [7, 8],
  // Sayuran
  13: [17, 39, 40, 44],
  14: [45, 41, 18],
  15: [34, 12],
  16: [67, 42],
  17: [13, 39, 40, 47],
  18: [41, 14, 40],
  39: [40, 13, 17],
  40: [39, 13, 44],
  41: [18, 14, 40],
  42: [16, 44],
  43: [14, 18],
  44: [40, 13],
  45: [14, 18],
  46: [39, 13],
  47: [17, 13],
  // Buah
  19: [54, 49, 48],
  20: [55, 22, 53],
  21: [62, 61, 33],
  22: [53, 20, 48],
  48: [49, 51, 54],
  49: [48, 54, 52],
  50: [51, 48],
  51: [50, 48],
  52: [53, 20, 22],
  53: [22, 52, 20],
  54: [19, 49, 48],
  55: [20, 22],
  // Lainnya
  23: [31, 58],
  24: [59, 62],
  25: [26, 67],
  26: [25, 67],
  56: [57, 58],
  57: [56, 26],
  58: [56, 23],
  59: [33, 61],
  60: [58, 59],
  63: [62, 61],
  64: [9, 10],
  65: [66, 67],
  66: [65, 67],
  67: [25, 26],
  68: [24],
  69: [36, 37],
  70: [46, 13]
};

// ============================================
// UTILITY FUNCTIONS & GENERATE THUMBNAIL
// ============================================
window.showToast = function(msg, type, duration){
  type = type || 'info';
  duration = duration || 1800;
  var colors = { success:'text-bg-success', info:'text-bg-primary', warning:'text-bg-warning', danger:'text-bg-danger' };
  var t = document.createElement('div');
  t.className = 'toast align-items-center ' + (colors[type]||colors.info) + ' border-0 show';
  t.style.cssText = 'position:fixed;bottom:20px;right:20px;z-index:9999;min-width:220px;box-shadow:0 8px 24px rgba(0,0,0,0.15);border-radius:8px';
  t.innerHTML = '<div class="d-flex"><div class="toast-body">' + msg + '</div><button type="button" class="btn-close btn-close-white me-2 m-auto" onclick="this.closest(\'.toast\').remove()"></button></div>';
  document.body.appendChild(t);
  setTimeout(function(){ t.remove(); }, duration);
};

window.showConfetti = function(x, y, count){
  count = count || 20;
  var colors = ['#ffd966','#0d6efd','#ff6b6b','#4da6ff','#b6e3a5'];
  for(var i=0; i<count; i++){
    var p = document.createElement('div');
    p.className = 'confetti-piece';
    p.style.left = x + 'px';
    p.style.top = y + 'px';
    p.style.background = colors[Math.floor(Math.random()*colors.length)];
    document.body.appendChild(p);
    var angle = Math.random()*Math.PI*2;
    var dist = 80 + Math.random()*120;
    var tx = Math.cos(angle)*dist;
    var ty = Math.sin(angle)*dist;
    p.animate([
      { transform:'translate(0,0) rotate(0deg)', opacity:1 },
      { transform:'translate('+tx+'px,'+ty+'px) rotate('+(Math.random()*720)+'deg)', opacity:0 }
    ], { duration: 1000+Math.random()*500, easing:'cubic-bezier(.2,.7,.3,1)' });
    setTimeout((function(el){ return function(){ el.remove(); }; })(p), 1600);
  }
};

// 🖼️ FUNGSI UNTUK MERENDER THUMBNAIL FOTO / FALLBACK SVG
window.generateMenuThumbnail = function(menu){
  // 1. Jika menu memiliki foto (tidak kosong), gunakan foto tersebut
  if (menu && menu.foto && menu.foto.trim() !== "") {
    return menu.foto;
  }

  // 2. Fallback: Buat warna SVG default jika tidak ada foto
  var first = menu.bahan && menu.bahan.length ? BAHAN.find(function(b){ return b.id === menu.bahan[0]; }) : null;
  var kat = first ? first.kategori : 'lain';
  var colors = {
    protein: ['#ffb3b3','#ff6b6b'],
    karbo:   ['#ffe08a','#ffb703'],
    sayur:   ['#b6e3a5','#4caf50'],
    buah:    ['#f7b7ff','#c77dff'],
    lain:    ['#cfcfcf','#9e9e9e']
  };
  var pair = colors[kat] || colors.lain;
  var c1 = pair[0], c2 = pair[1];
  var label = menu.nama.substring(0, 14).replace(/[<>&"']/g, '');
  var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="96" height="72">' +
    '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">' +
    '<stop offset="0%" stop-color="' + c1 + '"/>' +
    '<stop offset="100%" stop-color="' + c2 + '"/>' +
    '</linearGradient></defs>' +
    '<rect width="96" height="72" fill="url(#g)"/>' +
    '<text x="48" y="42" font-family="sans-serif" font-size="9" fill="#fff" text-anchor="middle" font-weight="700">' + label + '</text>' +
    '</svg>';
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
};

window.saveMenu = function(menuId, menuName){
  try {
    var plan = JSON.parse(localStorage.getItem('mealPlan')) || [];
    if(!plan.find(function(p){ return p.id === menuId; })){
      plan.push({ id: menuId, name: menuName, addedAt: Date.now() });
      localStorage.setItem('mealPlan', JSON.stringify(plan));
      window.showConfetti(window.innerWidth * 0.7, window.innerHeight * 0.2, 20);
      window.showToast('Disimpan ke Rencana Makanan ✓', 'success', 2000);
    } else {
      window.showToast('Menu sudah ada di rencana.', 'info', 1600);
    }
  } catch(err){
    console.error(err);
    window.showToast('Gagal menyimpan.', 'danger', 1800);
  }
};

window.isMenuSaved = function(menuId){
  var plan = JSON.parse(localStorage.getItem('mealPlan')) || [];
  return plan.some(function(p){ return p.id === menuId; });
};

window.logout = function(){
  var keepDark = localStorage.getItem('darkMode');
  localStorage.clear();
  if(keepDark) localStorage.setItem('darkMode', keepDark);
  window.location.href = 'index.html';
};

document.addEventListener('click', function(e){
  var btn = e.target.closest('.btn');
  if(!btn) return;
  var r = document.createElement('span');
  var rect = btn.getBoundingClientRect();
  r.style.cssText = 'position:absolute;border-radius:50%;transform:scale(0);background:rgba(255,255,255,0.5);pointer-events:none;left:' + (e.clientX-rect.left) + 'px;top:' + (e.clientY-rect.top) + 'px;width:10px;height:10px;';
  btn.style.position = 'relative';
  btn.style.overflow = 'hidden';
  btn.appendChild(r);
  r.animate([
    { transform:'scale(0)', opacity:0.6 },
    { transform:'scale(15)', opacity:0 }
  ], { duration:600 });
  setTimeout(function(){ r.remove(); }, 600);
});
