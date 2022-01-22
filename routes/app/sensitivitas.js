const multer = require('fastify-multer') // or import multer from 'fastify-multer'
const upload = multer({ dest: 'uploads/' })
const domain = require('../../domain');
const differenceInYears = require('date-fns/differenceInYears');
const parseISO = require('date-fns/parseISO')

function run (items, weights) {
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
  return items;
}

function sens (items, weights, mod_index, mod_value) {
  const modWeightsData = weights.data.map((w, index) => {
    if (index == mod_index) {
      return {
        ...w,
        value: parseInt(mod_value)
      }
    }
    return w;
  });
  const modWeights = {
    data: modWeightsData
  }
  const resultOri = run(items, weights);
  const resultMod = run(items, modWeights);
  return resultMod.map((it, index) => {
    let order = 'match';
    if (it.id != resultOri[index].id) {
      order = 'not-match';
    }
    const ori_pos = resultOri.findIndex(oit => oit.id == it.id);
    return {
      ...it,
      order,
      ori_pos,
      ori_s: resultOri[ori_pos].s,
      mod_pos: index
    }
  });
  // return resultMod;
}

module.exports = async (fastify) => {

  const db = fastify.db;

  fastify.route({
    method: 'GET',
    url: '/',
    handler: async (request, reply) => {
      const item = await db('settings').select().first();
      let data = JSON.parse(item.data);
      data = data.map((it, index) => ({
        ...it,
        name: domain.weightNames[index]
      }));
      reply.view('app/sensitivitas/form', {
        items: data
      });
    }
  })

  fastify.route({
    method: 'POST',
    url: '/',
    preHandler: upload.none(),
    handler: async (request, reply) => {
      let mod_index = request.body.index;
      let mod_value = request.body.value;

      // console.log(mod_index);
      // console.log(mod_value);

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
      // console.log(weights);
      weights.data = JSON.parse(weights.data);
      const result = sens(items, weights, mod_index, mod_value);
      reply.view('app/edho_sens/list', {
        items: result
      });
      // return 'ok';
    }
  })

}