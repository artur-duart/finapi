'use strict';

const express = require('express');
const { v4: uuidv4 } = require('uuid');
const app = express();
app.use(express.json());
const port = 3333;

const customers = [];

// Middleware
function verifyIfExistsAccountCPF(req, res, next) {
	const { cpf } = req.headers;
	const customer = customers.find((customer) => customer.cpf === cpf);

	if (!customer) {
		return res.status(400).json({
			error: 'Customer not found',
		});
	}

	req.customer = customer;

	return next();
}

app.post('/account', (req, res) => {
	const { cpf, name } = req.body;
	const customerAlredyExists = customers.some(
		(customer) => customer.cpf === cpf
	);

	if (customerAlredyExists) {
		return res.status(400).json({
			error: 'Customer already exists!',
		});
	}

	customers.push({
		cpf,
		name,
		id: uuidv4(),
		statement: [],
	});

	return res.status(201).send();
});

app.get('/statement', verifyIfExistsAccountCPF, (req, res) => {
	const { customer } = req;
	return res.json(customer.statement);
});

app.post('/deposit', verifyIfExistsAccountCPF, (req, res) => {
	const { description, amount } = req.body;
	const { customer } = req;

	const statementOperartion = {
		description,
		amount,
		created_at: new Date(),
		type: 'credit',
	};

	customer.statement.push(statementOperartion);

	return res.status(200).send();
});

app.listen(port);
