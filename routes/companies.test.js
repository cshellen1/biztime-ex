process.env.NODE_ENV = "test";

const app = require("../app");
const request = require("supertest");
const db = require("../db");

let testComp;
let testInv;
beforeEach(async () => {
  const result = await db.query(`INSERT INTO companies (code, name, description) VALUES ('test', 'TEST', 'This is only a test.') RETURNING *;`);
  const res = await db.query(`INSERT INTO invoices (comp_code, amt) VALUES ('test', '1500') RETURNING *`);
  testInv = res.rows[0];
  testComp = result.rows[0];
});


afterEach(async () => {
  await db.query(`DELETE FROM companies`); 
})

afterAll(async () => {
  await db.end();
})

describe("GET /companies", () => {
  test("Get a list of companies", async () => {
    const result = await request(app).get(`/companies`);
    expect(result.statusCode).toBe(200);
    expect(result.body).toEqual({ companies: [{ code: testComp.code, name: testComp.name }] });
  })
});

describe("GET /companies/:code", () => {
  test("Get a single company", async () => {
    const result = await request(app).get(`/companies/${testComp.code}`);
    console.log(testComp.code);
    expect(result.statusCode).toBe(200);
    expect(result.body.company.code).toEqual(testComp.code);
    expect(result.body.invoices[0].id).toEqual(testInv.id);
  })

  test("Responds with 404 if invalid id.", async () => {
    const result = await request(app).get(`/companies/zzzzz`);
    expect(result.statusCode).toBe(404);
  })
});

describe("POST /companies", () => {
  test("Creates a new company", async () => {
    const result = await request(app).post(`/companies`).send({ code: "newTest", name: "New Test", description: "The new test." });
    expect(result.statusCode).toBe(201);
    expect(result.body).toEqual({ company: { code: "newTest", name: "New Test", description: "The new test." } });
  })
});

describe("PATCH /companies/:code", () => {
  test("Updates a company", async () => {
    const result = await request(app).patch(`/companies/${testComp.code}`).send({ name: "Updated", description: "This is updated." });
    expect(result.statusCode).toBe(200);
    expect(result.body).toEqual({ company: {code: testComp.code, name: "Updated", description: "This is updated."} });
  })

  test("Responds with 404 if invalid id.", async () => {
    const result = await request(app).patch(`/companies/zzzzz`);
    expect(result.statusCode).toBe(404);
  })
});

describe("DELETE /companies/:code", () => {
  test("Deletes a company", async () => {
    const result = await request(app).delete(`/companies/${testComp.code}`);
    expect(result.statusCode).toBe(200);
    expect(result.body).toEqual({ status: "deleted" });
  })

  test("Responds with 404 if invalid id.", async () => {
    const result = await request(app).delete(`/companies/zzzzz`);
    expect(result.statusCode).toBe(404);
  })
})