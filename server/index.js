const express = require('express');
const app = express();
const {
	client,
	createTables,
	createRestaurant,
	createCustomer,
	fetchRestaurants,
	fetchCustomers,
	createReservations,
	fetchReservations,
	destroyReservations,
} = require('./db');

app.get('/api/customers', async (req, res, next) => {
	try {
		res.send(await fetchCustomers());
	} catch (ex) {
		next(ex);
	}
});

app.get('/api/restaurants', async (req, res, next) => {
	try {
		res.send(await fetchRestaurants());
	} catch (ex) {
		next(ex);
	}
});

app.get('/api/reservations', async (req, res, next) => {
	try {
		res.send(await fetchReservations());
	} catch (ex) {
		next(ex);
	}
});

app.delete(
	'/api/customers/:customer_id/reservations/:id',
	async (req, res, next) => {
		try {
			await destroyReservations({
				customer_id: req.params.customer_id,
				id: req.params.id,
			});
			res.sendStatus(204);
		} catch (ex) {
			next(ex);
		}
	}
);

app.post('/api/customers/:id/reservations', async (req, res, next) => {
	try {
		res.status(201).send(
			await createReservations({
				customer_id: req.params.customer_id,
				reservation_date: req.body.reservation_date,
				party_count: req.body.party_count,
				restaurant_id: req.body.restaurant_id,
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
	const [austin, emma, alex, elli, Chophouse, Sybergs, Tonys] =
		await Promise.all([
			createCustomer({ name: 'austin' }),
			createCustomer({ name: 'emma' }),
			createCustomer({ name: 'alex' }),
			createCustomer({ name: 'elli' }),
			createRestaurant({ name: 'Chophouse' }),
			createRestaurant({ name: 'Sybergs' }),
			createRestaurant({ name: 'Tonys' }),
		]);

	const [reservation, reservation2] = await Promise.all([
		createReservations({
			customer_id: austin.id,
			party_count: 2,
			restaurant_id: Chophouse.id,
			reservation_date: '02/14/2024',
		}),
		createReservations({
			customer_id: alex.id,
			party_count: 2,
			restaurant_id: Sybergs.id,
			reservation_date: '02/28/2024',
		}),
	]);

	const port = process.env.PORT || 3000;
	app.listen(port, () => {
		console.log(`Listening to port ${port}`);
	});
};

init();
