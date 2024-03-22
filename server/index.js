const express = require('express');
const app = express();
const {
	client,
	createTables,
	createPlace,
	createUser,
	fetchPlaces,
	fetchUsers,
	createVacation,
	fetchVacations,
	destroyVacation,
} = require('./db');

app.get('/api/users', async (req, res, next) => {
	try {
		res.send(await fetchUsers());
	} catch (ex) {
		next(ex);
	}
});

app.get('/api/places', async (req, res, next) => {
	try {
		res.send(await fetchPlaces());
	} catch (ex) {
		next(ex);
	}
});

app.get('/api/vacations', async (req, res, next) => {
	try {
		res.send(await fetchVacations());
	} catch (ex) {
		next(ex);
	}
});

app.delete('/api/users/:user_id/vacations/:id', async (req, res, next) => {
	try {
		await destroyVacation({ user_id: req.params.user_id, id: req.params.id });
		res.sendStatus(204);
	} catch (ex) {
		next(ex);
	}
});

app.post('/api/users/:user_id/vacations', async (req, res, next) => {
	try {
		res.status(201).send(
			await createVacation({
				user_id: reqparams.user_id,
				place_id: req.body.place_id,
				departure_date: req.body.departure_date,
			})
		);
	} catch (ex) {
		next(ex);
	}
});

app.use((err, req, res, next) => {
	res.status(err.status || 500).send({ error: err.message || err });
});

const init = async () => {
	await client.connect();
	console.log('DB connected');
	await createTables();
	console.log('Created tables');
	const [austin, emma, alex, elli, mexico, italy, paris] = await Promise.all([
		createUser({ name: 'austin' }),
		createUser({ name: 'emma' }),
		createUser({ name: 'alex' }),
		createUser({ name: 'elli' }),
		createPlace({ name: 'mexico' }),
		createPlace({ name: 'italy' }),
		createPlace({ name: 'paris' }),
	]);

	const [vacation, vacation2] = await Promise.all([
		createVacation({
			user_id: austin.id,
			place_id: italy.id,
			departure_date: '02/14/2024',
		}),
		createVacation({
			user_id: austin.id,
			place_id: italy.id,
			departure_date: '02/28/2024',
		}),
	]);
	
	await destroyVacation({ id: vacation.id, user_id: vacation.user_id });

	const port = process.env.PORT || 3000;
	app.listen(port, () => {
		console.log(`Listening to port ${port}`);
	});
};

init();
