CREATE DATABASE MATCHA_DB;

\c MATCHA_DB;

CREATE EXTENSION
IF NOT EXISTS postgis;
CREATE TYPE gender_type AS ENUM
('male', 'female');


CREATE TABLE users
(
	id SERIAL PRIMARY KEY,
	username VARCHAR(50) NOT NULL,
	email VARCHAR(255) NOT NULL,
	password VARCHAR(255) NOT NULL,
	first_name VARCHAR(50) NOT NULL,
	last_name VARCHAR(50) NOT NULL,
	refresh_token VARCHAR(255),
	is_verified BOOLEAN DEFAULT FALSE,
	bio TEXT,
	rating INTEGER DEFAULT 0,
	gender gender_type DEFAULT NULL,
	latitude DOUBLE PRECISION,
	longitude DOUBLE PRECISION,
	location GEOMETRY(POINT,
	4326), 
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

	CREATE TABLE interests
	(
		id SERIAL PRIMARY KEY,
		name VARCHAR(50) NOT NULL
	);

	CREATE TABLE user_interests
	(
		user_id INTEGER REFERENCES users(id),
		interest_id INTEGER REFERENCES interests(id),
		PRIMARY KEY (user_id, interest_id)
		-- Ensure uniqueness of user-interest combinations
	);

	CREATE TABLE images
	(
		id SERIAL PRIMARY KEY,
		user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
		url VARCHAR(255) NOT NULL,
		is_profile BOOLEAN DEFAULT FALSE
	);

	CREATE TABLE friendships
	(
		id SERIAL PRIMARY KEY,
		user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
		friend_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		UNIQUE (user_id, friend_id)
	);

	-- Seed users with specific coordinates for the required distances
INSERT INTO users (username, email, password, first_name, last_name, location)
VALUES 
  ('user1', 'user1@example.com', 'password1', 'John', 'Doe', ST_SetSRID(ST_MakePoint(-118.2437, 34.0522), 4326)), -- Los Angeles, CA
  ('user2', 'user2@example.com', 'password2', 'Jane', 'Smith', ST_SetSRID(ST_MakePoint(-118.2438, 34.0521), 4326)), -- Nearby user (within 5 km)
  ('user3', 'user3@example.com', 'password3', 'Alice', 'Brown', ST_SetSRID(ST_MakePoint(-118.2440, 34.0523), 4326)), -- Nearby user (within 5 km)
  ('user4', 'user4@example.com', 'password4', 'Bob', 'Johnson', ST_SetSRID(ST_MakePoint(-118.2937, 34.0525), 4326)), -- Farther user (within 10 km)
  ('user5', 'user5@example.com', 'password5', 'Charlie', 'Davis', ST_SetSRID(ST_MakePoint(-118.2938, 34.0530), 4326)); -- Farther user (within 10 km)
