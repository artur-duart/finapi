'use strict';

const express = require('express');
const { v4: uuidv4 } = require('uuid');
const app = express();
app.use(express.json());
const port = 3333;

const customers = [];

// cpf - String
// name - String
// id - uuid
// statement []

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

app.listen(port);