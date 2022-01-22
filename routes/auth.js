const multer = require('fastify-multer') // or import multer from 'fastify-multer'
const upload = multer({ dest: 'uploads/' })

module.exports = async (fastify) => {

	const db = fastify.db;

	fastify.route({
		method: 'GET',
		url: '/signup-admin',
		handler: async (request, reply) => {
			reply.view('auth/signup-admin', {});
		}
	})

	fastify.route({
		method: 'POST',
		url: '/signup-admin',
		preHandler: upload.none(),
		handler: async (request, reply) => {
			let payload = request.body;
			payload = {
				...payload,
				role: 'ADMIN'
			}
			console.log('payload')
			console.log(payload)
			const insertResult = await db.insert(payload).into('app_user');
			reply.redirect('/auth/signin');
		}
	})

	fastify.route({
		method: 'GET',
		url: '/signup',
		handler: async (request, reply) => {
			reply.view('auth/signup', {});
		}
	})

	fastify.route({
		method: 'POST',
		url: '/signup',
		preHandler: upload.none(),
		handler: async (request, reply) => {
			let payload = request.body;
			payload.role = 'USER';
			const insertResult = await db.insert(payload).into('app_user');
			reply.redirect('/auth/signin');
		}
	})

	fastify.route({
		method: 'GET',
		url: '/signin',
		handler: async (request, reply) => {
			console.log(request.session);
			if (request.session.user) {
				reply.redirect('/');
				return;
			}
			const auth_err = request.session.auth_err;
			let data = {};
			if (auth_err) {
				data.auth_err = auth_err;
			}
			reply.view('auth/signin', data);
		}
	})

	fastify.route({
		method: 'GET',
		url: '/logout',
		handler: async (request, reply) => {
			request.destroySession(err => {
				console.log(err);
				reply.redirect('/');
			})
		}
	})

	fastify.route({
		method: 'POST',
		url: '/signin',
		preHandler: upload.none(),
		handler: async (request, reply) => {
			delete request.session.auth_err;
			const { username, password } = request.body;
			const user = await db('app_user').where('username', '=', username).first();
			if (!user) {
				request.session.auth_err = {
					type: 'USER_NOT_FOUND',
					message: 'user tidak ditemukan'
				};
				reply.redirect('/auth/signin');
				return;
			} else if (user.password != password) {
				request.session.auth_err = {
					type: 'PASS_ERR',
					message: 'pasword tidak cocok'
				};
				reply.redirect('/auth/signin');
				return;
			} else {
				request.session.user = user;
				reply.redirect('/app/data');
			}
		}
	})

}