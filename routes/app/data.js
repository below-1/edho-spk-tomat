const multer = require('fastify-multer') // or import multer from 'fastify-multer'
const upload = multer({ dest: 'uploads/' })
const parse = require('date-fns/parse')
const parseISO = require('date-fns/parseISO')
const format = require('date-fns/format')

module.exports = async (fastify) => {

	const db = fastify.db;
	
	fastify.route({
		method: 'GET',
		url: '/overview',
		handler: async (request, reply) => {
			let items = await db
				.select([
					'd.id',
					'd.nama',
					db.raw('count(kt.id) as total')
				])
				.from('desa as d')
				.leftJoin('kelompok_tani as kt', 'kt.id_desa', 'd.id')
				.groupBy('d.id');
			const labels = JSON.stringify(items.map(it => it.nama));
			const data = JSON.stringify(items.map(it => it.total));
			reply.view('app/overview', {
				labels,
				data,
				session: request.session
			});
		}
	})

	fastify.route({
		method: 'GET',
		url: '/',
		handler: async (request, reply) => {
			let items = await db
				.select([
					'kt.id',
					'kt.nama',
					'kt.jumlah_anggota',
					'kt.ketua',
					'kt.tanggal_pembentukan',
					'kt.luas_lahan',
					'd.nama as desa_nama',
					'd.id as desa_id',
				])
				.from('kelompok_tani as kt')
				.leftJoin('desa as d', 'd.id', 'kt.id_desa');
			const session = request.session;
			items = items.map(it => {
				const t1 = parseISO(it.tanggal_pembentukan);
				const display_tp = format(t1, 'dd-MM-yyyy');
				return {
					...it,
					display_tp
				}
			})
			reply.view('app/data/list', {
				items,
				session
			});
		}
	})


	fastify.route({
		method: 'GET',
		url: '/create',
		handler: async (request, reply) => {
			const desa_list = await db('desa').select();
			console.log(desa_list);
			// reply.send('OK');
			reply.view('app/data/create', {
				desa_list,
				session: request.session
			});
		}
	})

	fastify.route({
		method: 'POST',
		url: '/create',
		preHandler: upload.none(),
		handler: async (request, reply) => {
			let payload = request.body;
			payload.tanggal_pembentukan = parse(payload.tanggal_pembentukan, 'yyyy-MM-dd', new Date()).toISOString();
			await db('kelompok_tani').insert(payload);
			reply.redirect('/app/data');
		}
	})

	fastify.route({
		method: 'GET',
		url: '/:id/edit',
		handler: async (request, reply) => {
			const id = request.params.id;
			let item = await db('kelompok_tani').where('id', '=', id).first();
			console.log(`item = ${item.tanggal_pembentukan}`);
			const t1 = parseISO(item.tanggal_pembentukan);
			console.log(`t1 = ${t1}`);
			const display_tp = format(t1, 'yyyy-MM-dd');
			console.log(`display_tp: ${display_tp}`);
			item.tanggal_pembentukan = display_tp;

			const desa_list = await db('desa').select();

			// reply.send('OK');
			reply.view('app/data/edit', {
				item,
				desa_list,
				session: request.session
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
			payload.tanggal_pembentukan = parse(payload.tanggal_pembentukan, 'yyyy-MM-dd', new Date()).toISOString();
			await db('kelompok_tani')
				.where('id', '=', id)
				.update(payload);
			reply.redirect('/app/data');
		}
	})

	fastify.route({
		method: 'GET',
		url: '/:id/delete_confirm',
		handler: async (request, reply) => {
			const id = request.params.id;
			let item = await db('kelompok_tani').where('id', '=', id).first();
			// reply.send('OK');
			reply.view('app/data/delete_confirm', {
				item,
				session: request.session
			});
		}
	})

	fastify.route({
		method: 'GET',
		url: '/:id/delete',
		handler: async (request, reply) => {
			const id = request.params.id;
			await db('kelompok_tani').where('id', '=', id).delete();
			reply.redirect('/app/data');
		}
	})

}