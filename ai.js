// ============================================
// AI MODULE — CBF + KNN + XAI + HYBRID
// ============================================

// 1. VECTORIZATION
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

// 2. COSINE SIMILARITY
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

// 3. CONTENT-BASED FILTERING
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

// 4. K-NEAREST NEIGHBORS
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

// 5. HYBRID RECOMMENDER
var HYBRID_WEIGHTS = {
  cbf: 0.5,
  knn: 0.3,
  rating: 0.2
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

// 6. EXPLAINABLE AI (XAI)
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

// 7. RATING SYSTEM
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

// 8. AUTO-TUNING BOBOT
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

// EXPORT TO WINDOW
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
console.log('🤖 AI Recommender System Loaded (CBF + KNN + Hybrid + XAI)');
