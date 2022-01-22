const multer = require('fastify-multer') // or import multer from 'fastify-multer'
const upload = multer({ dest: 'uploads/' })

module.exports = async (fastify) => {

  const db = fastify.db;

  fastify.route({
    method: 'GET',
    url: '/',
    handler: async (request, reply) => {
      const items = await db('varietas').select();
      reply.view('app/varietas/list', {
        items,
        session: request.session
      });
    }
  })

  fastify.route({
    method: 'GET',
    url: '/create',
    handler: async (request, reply) => {
      reply.view('app/varietas/create', {
        session: request.session
      });
    }
  })

  fastify.route({
    method: 'POST',
    url: '/create',
    preHandler: upload.none(),
    handler: async (request, reply) => {
      const payload = request.body;
      const result = await db('varietas').insert(payload);
      console.log(result);
      reply.redirect('/app/varietas');
    }
  })

  fastify.route({
    method: 'GET',
    url: '/:id/delete_confirm',
    handler: async (request, reply) => {
      let id = request.params.id
      let item = await db('varietas').where('id', '=', id).first()
      reply.view('app/varietas/delete_confirm', {
        item,
        session: request.session
      });
    }
  })

  fastify.route({
    method: 'GET',
    url: '/:id/delete',
    handler: async (request, reply) => {
      let id = request.params.id
      await db('varietas').where('id', '=', id).delete()
      reply.redirect('/app/varietas', {
        session: request.session
      });
    }
  })

  fastify.route({
    method: 'GET',
    url: '/:id/edit',
    handler: async (request, reply) => {
      let id = request.params.id
      let item = await db('varietas').where('id', '=', id).first();
      reply.view('app/varietas/edit', {
        item,
        session: request.session
      });
    }
  })

  fastify.route({
    method: 'POST',
    url: '/:id/edit',
    preHandler: upload.none(),
    handler: async (request, reply) => {
      let id = request.params.id
      let item = await db('varietas').where('id', '=', id).first();
      const payload = request.body;
      await db('varietas')
        .where('id', '=', id)
        .update({
          'nama': payload.nama
        });
      reply.redirect('/app/varietas');
    }
  })

}