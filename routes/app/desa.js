const multer = require('fastify-multer') // or import multer from 'fastify-multer'
const upload = multer({ dest: 'uploads/' })

module.exports = async (fastify) => {

	const db = fastify.db;

	fastify.route({
		method: 'GET',
		url: '/',
		handler: async (request, reply) => {
			const items = await db('desa').select();
			reply.view('app/desa/list', {
				items
			});
		}
	})

	fastify.route({
		method: 'GET',
		url: '/create',
		handler: async (request, reply) => {
			reply.view('app/desa/create');
		}
	})

	fastify.route({
		method: 'POST',
		url: '/create',
		preHandler: upload.none(),
		handler: async (request, reply) => {
			const payload = request.body;
			const result = await db('desa').insert(payload);
			console.log(result);
			reply.redirect('/app/desa');
		}
	})

	fastify.route({
		method: 'GET',
		url: '/:id/delete_confirm',
		handler: async (request, reply) => {
			let id = request.params.id
			let item = await db('desa').where('id', '=', id).first()
			reply.view('app/desa/delete_confirm', {
				item
			});
		}
	})

	fastify.route({
		method: 'GET',
		url: '/:id/delete',
		handler: async (request, reply) => {
			let id = request.params.id
			await db('desa').where('id', '=', id).delete()
			reply.redirect('/app/desa')
		}
	})

	fastify.route({
		method: 'GET',
		url: '/:id/edit',
		handler: async (request, reply) => {
			reply.view('app/desa/edit');
		}
	})

	fastify.route({
		method: 'POST',
		url: '/:id/edit',
		handler: async (request, reply) => {
			reply.view('app/desa/edit');
		}
	})

}