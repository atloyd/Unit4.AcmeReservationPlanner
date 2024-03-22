const pg = require('pg');
const express = require('express');
const app = express();
const uuid = require('uuid');
const client = new pg.Client(
	process.env.DB_NAME || 'postgres://localhost/the_acme_reservation_planner'
);

const createTables = async () => {
	let SQL = /* SQL */ `
    DROP TABLE IF EXISTS reservation;
    DROP TABLE IF EXISTS customer;
    DROP TABLE IF EXISTS restaurant;

    CREATE TABLE customer(
        id UUID PRIMARY KEY,
        name VARCHAR(50) NOT NULL UNIQUE
    );

    CREATE TABLE restaurant(
        id UUID PRIMARY KEY,
        name VARCHAR(50) NOT NULL UNIQUE
    );

    CREATE TABLE reservation(
        id UUID PRIMARY KEY,
        reservation_date DATE NOT NULL,
        party_count INTEGER NOT NULL,
        customer_id UUID REFERENCES customer(id) NOT NULL,
        restaurant_id UUID REFERENCES restaurant(id) NOT NULL
    );
    `;

	await client.query(SQL);
};

// create user

const createCustomer = async ({ name }) => {
	const SQL = /*SQL*/ `
    INSERT INTO customer(id, name) VALUES($1, $2) RETURNING *
    `;
	const response = await client.query(SQL, [uuid.v4(), name]);
	return response.rows[0];
};

// create place

const createRestaurant = async ({ name }) => {
	const SQL = /*SQL*/ `
    INSERT INTO restaurant(id, name) VALUES($1, $2) RETURNING *
    `;
	const response = await client.query(SQL, [uuid.v4(), name]);
	return response.rows[0];
};

const fetchCustomers = async () => {
	const SQL = /* SQL */ `
    SELECT * FROM customer
    `;
	const response = await client.query(SQL);
	return response.rows;
};

const fetchRestaurants = async () => {
	const SQL = /* SQL */ `
    SELECT * FROM restaurant
    `;
	const response = await client.query(SQL);
	return response.rows;
};

const createReservations = async ({
	reservation_date,
	party_count,
	restaurant_id,
	customer_id,
}) => {
	const SQL = /*SQL*/ `
      INSERT INTO reservation(id, reservation_date, party_count, restaurant_id, customer_id) VALUES($1, $2, $3, $4, $5) RETURNING *
    `;
	const response = await client.query(SQL, [
		uuid.v4(),
		reservation_date,
		party_count,
		restaurant_id,
		customer_id,
	]);
	return response.rows[0];
};

const fetchReservations = async () => {
	const SQL = /*SQL*/ `
  SELECT * FROM vacations
    `;
	const response = await client.query(SQL);
	return response.rows;
};

const destroyReservations = async ({ id, customer_id }) => {
	const SQL = /*SQL*/ `
      DELETE FROM reservation
      WHERE id = $1 AND customer_id = $2
    `;
	await client.query(SQL, [id, customer_id]);
};

module.exports = {
	client,
	createTables,
	createRestaurant,
	createCustomer,
	fetchRestaurants,
	fetchCustomers,
	createReservations,
	fetchReservations,
	destroyReservations,
};
