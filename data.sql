DROP DATABASE IF EXISTS biztime;

CREATE DATABASE biztime;

\c biztime

DROP TABLE IF EXISTS invoices;
DROP TABLE IF EXISTS companies;
DROP TABLE IF EXISTS industries;

CREATE TABLE companies (
    code text PRIMARY KEY,
    name text NOT NULL UNIQUE,
    description text
);

CREATE TABLE industries (
    code text PRIMARY KEY,
    industry text NOT NULL UNIQUE
);

CREATE TABLE invoices (
    id serial PRIMARY KEY,
    comp_code text NOT NULL REFERENCES companies ON DELETE CASCADE,
    amt float NOT NULL,
    paid boolean DEFAULT false NOT NULL,
    add_date date DEFAULT CURRENT_DATE NOT NULL,
    paid_date date,
    CONSTRAINT invoices_amt_check CHECK ((amt > (0)::double precision))
);

CREATE TABLE industries_companies (
  company_code TEXT NOT NULL REFERENCES companies,
  industry_code TEXT NOT NULL REFERENCES industries,
  PRIMARY KEY(company_code, industry_code)
);

INSERT INTO companies (code, name, description)
  VALUES ('apple', 'Apple Computer', 'Maker of OSX.'),
         ('ibm', 'IBM', 'Big blue.'),
         ('rich', 'Richmond American Homes', 'Home builder.'),
         ('shj', 'Sharkey Hawes and Javer', 'Financial planning firm.');

INSERT INTO invoices (comp_code, amt, paid, paid_date)
  VALUES ('apple', 100, false, null),
         ('apple', 200, false, null),
         ('apple', 300, true, '2018-01-01'),
         ('ibm', 400, false, null);

INSERT INTO industries (code, industry)
  VALUES ('tech', 'Technology'),
         ('acct', 'Accounting'),
         ('con', 'Construction'),
         ('finance', 'Finance');

INSERT INTO industries_companies (company_code, industry_code)
  VALUES ('apple', 'tech'),
         ('ibm', 'tech'),
         ('rich', 'con'),
         ('shj', 'finance'),
         ('shj', 'acct'),
         ('apple', 'finance'),
         ('rich', 'finance');

-- -- SELECT c.name, i.industry 
-- -- FROM companies AS c
-- -- JOIN industries_companies AS inco 
-- -- ON c.code = inco.company_code
-- -- JOIN industries AS i 
-- -- ON inco.industry_code = i.code;