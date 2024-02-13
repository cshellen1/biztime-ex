// routes for companies

const express = require("express");
const ExpressError = require("../expressError");
const router = express.Router();
const db = require("../db");
const slugify = require('slugify');


router.get("/", async (req, res, next) => {
	try {
		const results = await db.query("SELECT code, name FROM companies");
		return res.json({ companies: results.rows });
	} catch (e) {
		return next(e);
	}
});

router.get("/:code", async (req, res, next) => {
	try {
		const { code } = req.params;
		const result = await db.query(
			"SELECT * FROM companies FULL JOIN invoices ON companies.code = invoices.comp_code WHERE code=$1",
			[code]
		);
		if (!result.rows[0]) {
			throw new ExpressError(`${code} not found`, 404);
		}
		const res1 = await db.query(`SELECT c.name, i.industry FROM companies AS c JOIN industries_companies AS inco ON c.code = inco.company_code JOIN industries AS i ON inco.industry_code = i.code WHERE c.code=$1`, [code]);

		const { name, description } = result.rows[0];
		const invoices = [];
		const industries = [];
		for (let row of res1.rows) {
			const industry = { industry: row["industry"] };
			industries.push(industry);
		}
		for (let row of result.rows) {
			const invoice = {
				id: row["id"],
				comp_code: row["comp_code"],
				amt: row["amt"],
				paid: row["paid"],
				add_date: row["add_date"],
				paid_date: row["paid_date"],
			};
			invoices.push(invoice);
		}
		return res.status(200).json({
			company: { code, name, description },
			invoices: invoices,
			industries: industries,
		});
	} catch (e) {
		return next(e);
	}
});

router.post("/", async (req, res, next) => {
	try {
		const { name, description } = req.body;
		const code = slugify(name, {
			replacement: '_',
			remove: undefined,
			lower: true,
			strict: true,
			locale: 'vi'
		})
		
		const results = await db.query(
			"INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) RETURNING *",
			[code, name, description]
		);
		return res.status(201).json({ company: results.rows[0] });
	} catch (e) {
		return next(e);
	}
});

router.patch("/:code", async (req, res, next) => {
	try {
		const { code } = req.params;
		const { name, description } = req.body;
		const results = await db.query(
			"UPDATE companies SET name=$2, description=$3 WHERE code=$1 RETURNING *",
			[code, name, description]
		);
		if (!results.rows[0]) {
			throw new ExpressError(`${code} cannot be found`, 404);
		}
		return res.json({ company: results.rows[0] });
	} catch (e) {
		return next(e);
	}
});

router.delete("/:code", async (req, res, next) => {
	try {
		const { code } = req.params;
		const results = await db.query("DELETE FROM companies WHERE code=$1", [
			code,
		]);
		if (results.rowCount == 0) {
			throw new ExpressError(`${code} cannot be found`, 404);
		}
		return res.json({ status: "deleted" });
	} catch (e) {
		return next(e);
	}
});

module.exports = router;
