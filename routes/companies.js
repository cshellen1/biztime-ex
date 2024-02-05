// routes for companies

const express = require("express");
const ExpressError = require("../expressError");
const router = express.Router();
const db = require("../db");

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
			"SELECT * FROM companies JOIN invoices ON companies.code = invoices.comp_Code WHERE code=$1",
			[code]
		);
		if (!result.rows[0]) {
			throw new ExpressError(`${code} not found`, 404);
		}
		const { name, description } = result.rows[0];
		const invoices = [];
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
		return res.json({
			company: { code, name, description },
			invoices: invoices,
		});
	} catch (e) {
		return next(e);
	}
});

router.post("/", async (req, res, next) => {
	try {
		const { code, name, description } = req.body;
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
