function convert_jumlah_anggota (x) {
  if (x > 26) return 5;
  if (x >= 21 && x <= 26) return 4;
  if (x >= 16 && x <= 20) return 3;
  if (x >= 10 && x <= 15) return 2;
  if (x < 10) return 1;
}

function convert_luas_lahan (x) {
  if (x > 20) return 5;
  if (x >= 16 && x <= 20) return 4;
  if (x >= 11 && x <= 15) return 3;
  if (x >= 5 && x <= 10) return 2;
  if (x < 5) return 1;
}

function convert_usia (x) {
  if (x > 15) return 5;
  if (x >= 11 && x <= 15) return 4;
  if (x >= 6 && x <= 10) return 3;
  if (x >= 1 && x <= 5) return 2;
  if (x < 1) return 1;
}

function convert_kp (x) {
  if (x == 1) return 'Busuk daun';
  if (x == 2) return 'Busuk buah';
  if (x == 3) return 'virus kuning';
  if (x == 4) return 'Layu fusarium';
  if (x == 5) return 'Layu bakteri';
  else throw new Error(`unknown kp ${x}`);
}

function convert_jt (x) {
  if (x == 1) return '40x50';
  if (x == 2) return '60x50';
  if (x == 3) return '80x50';
  else throw new Error(`unknown kp ${x}`);
}

const weightNames = [
  'Jarak Tanam',
  'Umur Panen',
  'Daya Tumbuh',
  'Kadar Air',
  'Lokasi Lahan',
  'Ketahanan Penyakit',
  'Harga Benih',
  'Berat',
  'Hasil Panen'
];

const WPConverter = [
  (row) => {
    const x = row.jarak_tanam;
    if (x == 1) return 1;
    if (x == 2) return 3;
    if (x == 3) return 5;
  },
  (row) => {
    const x = row.umur_panen;
    if (x > 120) return 1;
    if ((x > 100) && (x <= 120)) return 2;
    if ((x > 80) && (x <= 100)) return 3;
    if ((x > 60) && (x <= 80)) return 4;
    if (x <= 60) return 5;
  },
  (row) => {
    const x = row.daya_tumbuh;
    if (x <= 60) return 1;
    if ((x > 60) && (x <= 70)) return 2;
    if ((x > 70) && (x < 80)) return 3;
    if ((x > 80) && (x < 90)) return 4;
    if (x > 90) return 5;
  },
  (row) => {
    const x = row.kadar_air;
    if (x > 9) return 1;
    if ((x >= 7) && (x <= 9)) return 3;
    if (x <= 7) return 5;
  },
  (row) => {
    const x = row.lokasi.toUpperCase();
    if (x == 'DATARAN RENDAH') return 1;
    if (x == 'DATARAN MENENGAH') return 3;
    if (x == 'DATARAN TINGGI') return 5;
  },
  (row) => {
    return row.ketahanan_penyakit;
  },
  (row) => {
    const mid =  row.berat;
    if (mid < 30) return 1;
    if ((mid >= 30) && (mid < 50)) return 2;
    if ((mid >= 50) && (mid < 70)) return 3;
    if ((mid >= 70) && (mid < 90)) return 4;
    if (mid >= 90) return 5;
  },
  (row) => {
    const x = row.harga_benih;
    if (x > 150000) return 5;
    if (x <= 150000) return 1;
  },
  (row) => {
    const x = row.hasil_panen;
    if (x <= 3) return 1;
    if ((x >= 3) && (x < 6)) return 3;
    if (x >= 6) return 5;
  }
]

function wp_convert (obj) {
  return WPConverter.map(conv => conv(obj))
}

module.exports = {
  convert_usia,
  convert_jumlah_anggota,
  convert_luas_lahan,
  convert_kp,
  convert_jt,
  weightNames,
  WPConverter,
  wp_convert
}