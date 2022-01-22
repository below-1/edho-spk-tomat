const multer = require('fastify-multer') // or import multer from 'fastify-multer'
const upload = multer({ dest: 'uploads/' })
const parse = require('date-fns/parse')
const parseISO = require('date-fns/parseISO')
const format = require('date-fns/format')
const differenceInYears = require('date-fns/differenceInYears')
const carbone = require('carbone')
const path = require('path');
const domain = require('../../domain')

const report_template_path = path.join(process.cwd(), 'reports/ranks-perangkingan.docx');
const weights = [2,3,3,4,5,1]

function wp (weights, xs) {
	const total_weights = weights.reduce((a, b) => a + b, 0);
	const normed_weights = weights.map(w => w / total_weights);
	const S = xs.map(row => 
			row
				.map((x, j) => Math.pow(x, normed_weights[j]))
				.reduce((a, b) => a * b), 1);
	const total_s = S.reduce((a, b) => a + b, 0);
	const normed_s = S.map(s => s / total_s);
	return normed_s;
}

module.exports = async (fastify) => {

	const db = fastify.db;

	fastify.route({
		url: '/',
		method: 'GET',
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
					'kt.status_lahan',
					'kt.proposal',
					'kt.kartu_kt'
				])
				.from('kelompok_tani as kt')
				.leftJoin('desa as d', 'd.id', 'kt.id_desa');
			let xs = items.map(it => {
				console.log(it);
				const t1 = parseISO(it.tanggal_pembentukan);
				return [
					it.kartu_kt,
					domain.convert_jumlah_anggota(it.jumlah_anggota),
					domain.convert_luas_lahan(it.luas_lahan),
					it.status_lahan,
					it.proposal,
					domain.convert_usia(differenceInYears(new Date(), t1))
				]
			})

			const grades = wp(weights, xs);
			items = items.map((it, i) => {
				return {
					...it,
					grade: grades[i],
					grade_format: grades[i].toFixed(4)
				}
			})
			items.sort((a, b) => (a.grade > b.grade) ? -1 : 1)

			reply.view('app/rank/list', {
				items
			})
		}
	})

	fastify.route({
		method: 'GET',
		url: '/report',
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
					'kt.status_lahan',
					'kt.proposal',
					'kt.kartu_kt'
				])
				.from('kelompok_tani as kt')
				.leftJoin('desa as d', 'd.id', 'kt.id_desa');
			let xs = items.map(it => {
				console.log(it);
				const t1 = parseISO(it.tanggal_pembentukan);
				return [
					it.kartu_kt,
					domain.convert_jumlah_anggota(it.jumlah_anggota),
					domain.convert_luas_lahan(it.luas_lahan),
					it.status_lahan,
					it.proposal,
					domain.convert_usia(differenceInYears(new Date(), t1))
				]
			})

			const grades = wp(weights, xs);
			items = items.map((it, i) => {
				return {
					...it,
					grade: grades[i],
					grade_format: grades[i].toFixed(4)
				}
			})
			items.sort((a, b) => (a.grade > b.grade) ? -1 : 1)

			carbone.render(report_template_path, { items }, function(err, result) {
	      if (err) {
	        console.log(err);
	        reply.status(500).send('Error');
	        return;
	      }
	      reply
	        .header('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')
	        .header('Content-Disposition', 'attachment; filename="laporan.docx"')
	        .send(result);
	    });
		}
	})

}