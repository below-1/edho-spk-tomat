const multer = require('fastify-multer') // or import multer from 'fastify-multer'
const upload = multer({ dest: 'uploads/' })
const parse = require('date-fns/parse')
const parseISO = require('date-fns/parseISO')
const format = require('date-fns/format')
const differenceInYears = require('date-fns/differenceInYears')
const carbone = require('carbone')
const path = require('path');
const domain = require('../../domain')

module.exports = async (fastify) => {
  const db = fastify.db;

  fastify.route({
    url: '/',
    method: 'GET',
    handler: async (request, reply) => {
      let items = await db
        .select([
          'lp.id',
          'lp.nama_petani',
          'lp.alamat',
          'lp.luas_lahan',
          'lp.tanggal_keluar',
          'lp.berat_lower',
          'lp.berat_upper',
          'lp.harga_benih',
          'lp.daya_tumbuh',
          'lp.kadar_air',
          'lp.umur_panen_lower',
          'lp.umur_panen_upper',
          'lp.ketahanan_penyakit',
          'lp.jarak_tanam',
          'lp.lokasi',
          'lp.hasil_panen',
          'v.nama',
          'v.id as varietas_id',
          'v.nama as varietas_nama'
        ])
        .from('lp')
        .leftJoin('varietas as v', 'lp.varietas_id', 'v.id')
        .orderBy('lp.nama_petani', 'asc');
      let weights = await db
        .select()
        .from('settings')
        .first();
      weights.data = JSON.parse(weights.data);

      const XS = items.map(domain.wp_convert);
      const Wsum = weights.data
        .map(w => w.value)
        .reduce((a, b) => a + b, 0);
      const WNorm = weights.data.map(w => w.value / Wsum);
      const S = XS.map(
        xs => 
          xs.map((x, j) => {
            const raise = weights.data[j].cost ? (-1 * WNorm[j]) : WNorm[j];
            return Math.pow(x, raise);
          }).reduce((a, b) => a * b, 1)
      )
      const Ssum = S.reduce((a, b) => a + b, 0);
      const Snorm = S.map(s => s / Ssum);
      items = items.map((it, index) => ({
        ...it,
        s: Snorm[index]
      }));
      items.sort((a, b) => (a.s > b.s) ? -1 : 1)
      reply.view('app/edho_rank/list', {
        items
      });

      // let xs = items.map(it => {
      //   console.log(it);
      //   const t1 = parseISO(it.tanggal_pembentukan);
      //   return [
      //     it.kartu_kt,
      //     domain.convert_jumlah_anggota(it.jumlah_anggota),
      //     domain.convert_luas_lahan(it.luas_lahan),
      //     it.status_lahan,
      //     it.proposal,
      //     domain.convert_usia(differenceInYears(new Date(), t1))
      //   ]
      // })
      // const grades = wp(weights, xs);
      // items = items.map((it, i) => {
      //   return {
      //     ...it,
      //     grade: grades[i],
      //     grade_format: grades[i].toFixed(4)
      //   }
      // })
      // items.sort((a, b) => (a.grade > b.grade) ? -1 : 1)
      // reply.view('app/rank/list', {
      //   items
      // })
    }
  })
}