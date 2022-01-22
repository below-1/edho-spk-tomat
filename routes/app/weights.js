const multer = require('fastify-multer') // or import multer from 'fastify-multer'
const upload = multer({ dest: 'uploads/' })
const domain = require('../../domain')

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
      }))
      console.log(data);
      reply.view('app/weights', {
        data
      });
    }
  })

  fastify.route({
    method: 'POST',
    url: '/',
    preHandler: upload.none(),
    handler: async (request, reply) => {
      const payload = request.body;
      let oldItem = await db('settings').select().first();
      console.log(oldItem);
      oldItem.data = JSON.parse(oldItem.data);
      console.log(oldItem.data.map);
      const newData = oldItem.data.map((it, index) => {
        return {
          ...it,
          value: parseInt(payload[`k_${index}`])
        }
      })

      await db.transaction(async function (tx) {
        await tx('settings').truncate();
        await tx('settings').insert({
          data: JSON.stringify(newData)
        });
      });

      reply.redirect('/app/weights');
    }
  })
}