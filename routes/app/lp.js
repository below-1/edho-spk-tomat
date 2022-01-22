const multer = require('fastify-multer') // or import multer from 'fastify-multer'
const upload = multer({ dest: 'uploads/' })
const parse = require('date-fns/parse')
const parseISO = require('date-fns/parseISO')
const format = require('date-fns/format')
const domain = require('../../domain');

module.exports = async (fastify) => {
  const db = fastify.db;

  fastify.route({
    method: 'GET',
    url: '/',
    handler: async (request, reply) => {
      let items = await db
        .select([
          'lp.id',
          'lp.nama_petani',
          'lp.alamat',
          'lp.luas_lahan',
          'lp.tanggal_keluar',
          'lp.berat',
          'lp.harga_benih',
          'lp.daya_tumbuh',
          'lp.kadar_air',
          'lp.umur_panen',
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
      items = items.map(it => {
        const t1 = parseISO(it.tanggal_keluar);
        return {
          ...it,
          tanggal_keluar: format(t1, 'dd-MM-yyyy'),
          ketahanan_penyakit: domain.convert_kp(it.ketahanan_penyakit),
          jarak_tanam: domain.convert_jt(it.jarak_tanam)
        }
      })
      reply.view('app/lp/list', {
        items
      });
    }
  })

  fastify.route({
    method: 'GET',
    url: '/create',
    handler: async (request, reply) => {
      const varietas_list = await db('varietas').select();
      // reply.send('OK');
      reply.view('app/lp/create', {
        varietas_list
      });
    }
  })

  fastify.route({
    method: 'POST',
    url: '/create',
    preHandler: upload.none(),
    handler: async (request, reply) => {
      let payload = request.body;
      payload.tanggal_keluar = parse(payload.tanggal_keluar, 'yyyy-MM-dd', new Date()).toISOString();
      await db('lp').insert(payload);
      reply.redirect('/app/lp');
    }
  })

  fastify.route({
    method: 'GET',
    url: '/:id/edit',
    handler: async (request, reply) => {
      const id = request.params.id;
      let item = await db('lp').where('id', '=', id).first();
      const t1 = parseISO(item.tanggal_keluar);
      const tanggal_keluar = format(t1, 'yyyy-MM-dd');
      item.tanggal_keluar = tanggal_keluar;

      const varietas_list = await db('varietas').select();
      reply.view('app/lp/edit', {
        item,
        varietas_list
      });
    }
  })

  fastify.route({
    method: 'POST',
    url: '/:id/edit',
    preHandler: upload.none(),
    handler: async (request, reply) => {
      const id = request.params.id;
      let payload = request.body;
      console.log('payload')
      console.log(payload)
      payload.tanggal_keluar = parse(payload.tanggal_keluar, 'yyyy-MM-dd', new Date()).toISOString();
      await db('lp')
        .where('id', '=', id)
        .update(payload);
      reply.redirect('/app/lp');
    }
  })

  fastify.route({
    method: 'GET',
    url: '/:id/delete_confirm',
    handler: async (request, reply) => {
      const id = request.params.id;
      let item = await db('lp').where('id', '=', id).first();
      reply.view('app/lp/delete_confirm', {
        item
      });
    }
  })

  fastify.route({
    method: 'GET',
    url: '/:id/delete',
    handler: async (request, reply) => {
      const id = request.params.id;
      await db('lp').where('id', '=', id).delete();
      reply.redirect('/app/lp');
    }
  })
}