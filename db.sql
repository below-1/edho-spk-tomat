CREATE TABLE app_user (
  id integer primary key,
  username text,
  password text
, "role" TEXT DEFAULT ADMIN NOT NULL);

CREATE TABLE varietas (
  id integer primary key, 
  nama text, 
  low_ketahanan_penyakit INTEGER, 
  up_ketahanan_penyakit INTEGER, 
  up_jarak_tanam INTEGER, 
  low_jarak_tanam INTEGER, 
  up_jarak_tanam INTEGER, 
  low_umur_panen INTEGER, 
  up_umur_panen INTEGER, 
  low_daya_tumbuh REAL, 
  up_daya_tumbuh REAL,
  low_kadar_air REAL, 
  up_kadar_air REAL, 
  low_harga_benih INTEGER, 
  up_harga_benih INTEGER, 
  low_berat REAL, 
  up_berat REAL,
  low_hasil_panen REAL,
  up_hasil_panen REAL
);

CREATE TABLE settings (
  id integer primary key,
  data text
);
CREATE TABLE lp (
  id integer primary key,
  varietas_id integer not null,
  nama_petani text not null,
  alamat text not null,
  luas_lahan real not null,
  tanggal_keluar text not null,
  berat real not null,
  harga_benih integer not null,
  daya_tumbuh real not null,
  kadar_air real not null,
  umur_panen integer not null,
  ketahanan_penyakit integer not null,
  jarak_tanam integer not null,
  lokasi integer not null,
  hasil_panen real not null
);
