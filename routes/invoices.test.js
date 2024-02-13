process.env.NODE_ENV = "test";

const app = require("../app");
const request = require("supertest");
const db = require("../db");

let testComp;
let testInv;

beforeEach(async () => {
	const comResult = await db.query(
		`INSERT INTO companies (code, name, description) VALUES ('acme', 'ACME Corp', 'We make everything') RETURNING *`
	);
	testComp = comResult.rows[0];
	const invResult = await db.query(
		`INSERT INTO invoices (comp_code, amt) VALUES ('acme', '1500') RETURNING *`
	);
	testInv = invResult.rows[0];
});

afterEach(async () => {
	await db.query(`DELETE FROM invoices`);
	await db.query(`DELETE FROM companies`);
});

afterAll(async () => {
	await db.end();
});

describe("GET /invoices", () => {
	test("Get a list of invoices", async () => {
		const result = await request(app).get(`/invoices`);
		expect(result.statusCode).toBe(200);
		expect(result.body).toEqual({
			invoices: [{ id: testInv.id, comp_code: testInv.comp_code }],
		});
	});
});

describe("GET /invoices/:id", () => {
	test("Get a single invoice", async () => {
		const result = await request(app).get(`/invoices/${testInv.id}`);
		expect(result.statusCode).toBe(200);
		expect(result.body.invoice.id).toEqual(testInv.id);
	});

	test("Responds with 404 if invalid id.", async () => {
		const result = await request(app).get(`/invoices/0`);
		expect(result.statusCode).toBe(404);
	});
});

describe("POST /invoices", () => {
  test("Creates a new invoice", async () => {
    const result = await request(app).post(`/invoices`).send({ comp_code: "acme", amt: "2000" });
    expect(result.statusCode).toBe(201);
    expect(result.body.invoice.comp_code).toEqual("acme");
    expect(result.body.invoice.amt).toEqual(2000);
  })
});

