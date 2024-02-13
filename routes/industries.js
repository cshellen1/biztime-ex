// routes for industries

const express = require("express");
const ExpressError = require("../expressError");
const router = express.Router();
const db = require("../db");

router.get("/", async (req, res, next) => {
	try {
        const result = await db.query(`SELECT c.code, i.industry FROM companies AS c FULL JOIN industries_companies AS inco ON c.code = inco.company_code FULL JOIN industries AS i ON inco.industry_code = i.code`);
        
        const industries = {}
        for (let row of result.rows) {
            if (!industries[row["industry"]]) {
                industries[row["industry"]] = { companies: [row["code"]] }   
            }  else {
                industries[row["industry"]]["companies"].push([row["code"]]);
            }
        }
        
		return res.json({ industries: industries });
	} catch (e) {
		return next(e);
	}
});

router.post("/", async (req, res, next) => {
	try {
		const { code, industry } = req.body;
		const results = await db.query(
			"INSERT INTO industries (code, industry) VALUES ($1, $2) RETURNING *",
			[code, industry]
		);
		return res.status(201).json({ industry: results.rows[0] });
	} catch (e) {
		return next(e);
	}
});

router.patch("/", async (req, res, next) => {
	try {
		const { company_code, industry_code } = req.body;
		const results = await db.query(
			"INSERT INTO industries_companies (company_code, industry_code) VALUES ($1, $2) RETURNING *",
			[company_code, industry_code]
		);
		if (!results.rows[0]) {
			throw new ExpressError(`${company_code} or ${industry_code}cannot be found`, 404);
		}
		return res.status(201).json({ company: results.rows[0] });
	} catch (e) {
		return next(e);
	}
});



module.exports = router;