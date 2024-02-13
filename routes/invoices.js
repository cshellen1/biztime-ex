const express = require("express");
const ExpressError = require("../expressError");
const router = express.Router();
const db = require("../db");

const currDate = new Date();

router.get("/", async (req, res, next) => {
	try {
		const result = await db.query("SELECT id, comp_code FROM invoices");
		return res.json({ invoices: result.rows });
	} catch (e) {
		return next(e);
	}
});

router.get("/:id", async (req, res, next) => {
	try {
		const { id } = req.params;
		const results = await db.query(
			"SELECT * FROM invoices JOIN companies ON invoices.comp_code = companies.code WHERE id=$1",
			[id]
		);

		if (!results.rows[0]) {
			throw new ExpressError(`${id} not found`, 404);
		}

		const {
			id: invoiceId,
			comp_code,
			paid,
			paid_date,
			amt,
			add_date,
			code,
			name,
			description,
		} = results.rows[0];

		const invoice = {
			id: invoiceId,
			comp_code: comp_code,
			paid: paid,
			paid_date: paid_date,
			amt: amt,
			add_date: add_date,
		};
		const company = {
			code: code,
			name: name,
			description: description,
		};
		return res.json({
			invoice: {
				id: invoice.id,
				amt: invoice.amt,
				paid: invoice.paid,
				add_date: invoice.add_date,
				paid_date: invoice.paid_date,
				company: {
					code: company.code,
					name: company.name,
					description: company.description,
				},
			},
		});
	} catch (e) {
		return next(e);
	}
});

router.post("/", async (req, res, next) => {
	try {
		const { comp_code, amt } = req.body;
		const result = await db.query(
			"INSERT INTO invoices (comp_code, amt) VALUES ($1, $2) RETURNING *",
			[comp_code, amt]
		);
		return res.status(201).json({ invoice: result.rows[0] });
	} catch (e) {
		return next(e);
	}
});

router.patch("/:id", async (req, res, next) => {
	try {
		const { amt } = req.body;
		const { id } = req.params;
		const { paid } = req.body;

		if (paid) {
			const day = currDate.getDate();
			const month = currDate.getMonth();
			const year = currDate.getYear();
			const paidDate = `${year}-${month}-${day}`;
			
			const result = await db.query(
				"UPDATE invoices SET amt=$4, paid=$2, paid_date=$3 WHERE id=$1 RETURNING *",
				[id, paid, paidDate, amt]
			);
			if (!result.rows[0]) {
				throw new ExpressError(
					`Need to enter valid amount, commpany id, and paid status.`,
					404
				);
			}
			return res.json({ invoice: result.rows[0] });
		} else if (!paid) {
			const paidDate = null;
			const result = await db.query(
				"UPDATE invoices SET amt=$4, paid=$2, paid_date=$3 WHERE id=$1 RETURNING *",
				[id, paid, paidDate, amt]
			);
			if (!result.rows[0]) {
				throw new ExpressError(
					`Need to enter valid amount, commpany id, and paid status.`,
					404
				);
			}
			return res.json({ invoice: result.rows[0] });
		} else {
			const result = await db.query(
				"UPDATE invoices SET amt=$4 WHERE id=$1 RETURNING *",
				[id, amt]
			);
			if (!result.rows[0]) {
				throw new ExpressError(
					`Need to enter valid amount, commpany id, and paid status.`,
					404
				);
			}
			return res.json({ invoice: result.rows[0] });
		}
	} catch (e) {
		next(e);
	}
});

router.delete("/:id", async (req, res, next) => {
	try {
		const { id } = req.params;
		const results = await db.query("DELETE FROM invoices WHERE id=$1", [id]);
		if (results.rowCount == 0) {
			throw new ExpressError(`${id} cannot be found`, 404);
		}
		return res.json({ status: "deleted" });
	} catch (e) {
		return next(e);
	}
});

router.patch("/:id", async (req, res, next) => {
	try {
		const { id } = req.params;
		const { amt, paid } = req.body;
		const results = await db.query(
			"UPDATE invoicess SET amt=$2, paid=$3 WHERE id=$1 RETURNING *",
			[id, amt, paid]
		);
		if (!results.rows[0]) {
			throw new ExpressError(`${code} cannot be found`, 404);
		}
		return res.json({ invoice: results.rows[0] });
	} catch (e) {
		return next(e);
	}
});

module.exports = router;
