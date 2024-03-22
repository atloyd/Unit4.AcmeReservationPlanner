const pg = require('pg');
const express = require('express');
const app = express();
const uuid = require('uuid');
const client = new pg.Client(
	process.env.DB_NAME || 'postgres://localhost/acme_vacations'
);

const createTables = async () => {
	let SQL = /* SQL */ `
    DROP TABLE IF EXISTS vacations;
    DROP TABLE IF EXISTS users;
    DROP TABLE IF EXISTS places;

    CREATE TABLE users(
        id UUID PRIMARY KEY,
        name VARCHAR(50) NOT NULL UNIQUE
    );

    CREATE TABLE places(
        id UUID PRIMARY KEY,
        name VARCHAR(50) NOT NULL UNIQUE
    );

    CREATE TABLE vacations(
        id UUID PRIMARY KEY,
        departure_date DATE NOT NULL,
        user_id UUID REFERENCES users(id) NOT NULL,
        place_id UUID REFERENCES places(id) NOT NULL
    );
    `;

	await client.query(SQL);
	
};

// create user

const createUser = async ({ name }) => {
	const SQL = /*SQL*/ `
    INSERT INTO users(id, name) VALUES($1, $2) RETURNING *
    `;
	const response = await client.query(SQL, [uuid.v4(), name]);
	return response.rows[0];
};

// create place

const createPlace = async ({ name }) => {
	const SQL = /*SQL*/ `
    INSERT INTO places(id, name) VALUES($1, $2) RETURNING *
    `;
	const response = await client.query(SQL, [uuid.v4(), name]);
	return response.rows[0];
};

const fetchUsers = async () => {
	const SQL = /* SQL */ `
    SELECT * FROM users
    `;
	const response = await client.query(SQL);
	return response.rows;
};

const fetchPlaces = async () => {
	const SQL = /* SQL */ `
    SELECT * FROM places
    `;
	const response = await client.query(SQL);
	return response.rows;
};

const createVacation = async ({ place_id, user_id, departure_date }) => {
	const SQL = /*SQL*/ `
      INSERT INTO vacations(id, place_id, user_id, departure_date) VALUES($1, $2, $3, $4) RETURNING *
    `;
	const response = await client.query(SQL, [
		uuid.v4(),
		place_id,
		user_id,
		departure_date,
	]);
	return response.rows[0];
};

const fetchVacations = async () => {
	const SQL = /*SQL*/ `
  SELECT * FROM vacations
    `;
	const response = await client.query(SQL);
	return response.rows;
};

const destroyVacation = async ({ id, user_id }) => {
	const SQL = /*SQL*/ `
      DELETE FROM vacations
      WHERE id = $1 AND user_id = $2
    `;
	await client.query(SQL, [id, user_id]);
};

module.exports = {
	client,
	createTables,
	createPlace,
	createUser,
	fetchPlaces,
	fetchUsers,
	createVacation,
	fetchVacations,
	destroyVacation,
};
