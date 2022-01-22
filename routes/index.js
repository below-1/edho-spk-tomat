module.exports = async (fastify) => {

	fastify.get("/", (request, reply) => {
		reply.view("landing", {
			name: "Jordan"
		})
	});

	fastify.register(require('./auth'), { prefix: '/auth' });
	fastify.register(require('./app'), { prefix: '/app' });

};