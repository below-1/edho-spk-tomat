const fp = require("fastify-plugin");
const knex = require("knex");

module.exports = fp(async function (fastify) {
	const db = knex({
		client: "sqlite3",
		connection: {
			filename: process.env.DB_PATH
		},
		useNullAsDefault: true
	});

	fastify.decorate("db", db);
});
