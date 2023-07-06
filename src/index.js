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

function getBalance(statement) {
	const balance = statement.reduce((acc, operation) => {
		if (operation.type === 'deposit') {
			return acc + operation.amount;
		} else {
			return acc - operation.amount;
		}
	}, 0);

	return balance;
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
		amount: Number(amount),
		created_at: new Date(Date.now()),
		type: 'deposit',
	};

	customer.statement.push(statementOperartion);

	return res.status(200).send();
});

app.post('/withdraw', verifyIfExistsAccountCPF, (req, res) => {
	const { amount } = req.body;
	const { customer } = req;

	const balance = getBalance(customer.statement);

	if (balance < amount) {
		return res.status(400).json({
			error: 'Insufficient funds!',
		});
	}

	const statementOperartion = {
		amount: Number(amount),
		created_at: new Date(Date.now()),
		type: 'withdraw',
	};

	customer.statement.push(statementOperartion);

	return res.status(201).send();
});

app.get('/statement/date', verifyIfExistsAccountCPF, (req, res) => {
	const { customer } = req;
	const { date } = req.query;
	const [year, month, day] = date.split('-').map(Number);
	const dateFormat = new Date(Date.UTC(year, month - 1, day));
	const statement = customer.statement.filter(
		(statement) =>
			statement.created_at.toDateString() === dateFormat.toDateString()
	);

	return res.json(statement);
});

app.put('/account', verifyIfExistsAccountCPF, (req, res) => {
	const { name } = req.body;
	const { customer } = req;

	customer.name = name;

	return res.status(201).send();
});

app.get('/account', verifyIfExistsAccountCPF, (req, res) => {
	const { customer } = req;
	return res.json(customer);
});

app.listen(port);
