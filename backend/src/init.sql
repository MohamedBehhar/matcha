CREATE DATABASE MATCHA_DB;
\ c MATCHA_DB;
CREATE EXTENSION
IF NOT EXISTS postgis;
ALTER DATABASE MATCHA_DB OWNER TO matcha;
CREATE TYPE gender_type AS ENUM
('male', 'female');
CREATE TYPE  sexual_preference_type AS ENUM
('male', 'female', 'bi');
CREATE TABLE users
(
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    profile_picture VARCHAR(255),
    email VARCHAR(255) NOT NULL,
    date_of_birth DATE,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    refresh_token VARCHAR(255),
    is_verified BOOLEAN DEFAULT FALSE,
    is_authenticated BOOLEAN DEFAULT FALSE,
    bio TEXT,
    rating INTEGER DEFAULT 0,
    gender gender_type DEFAULT NULL,
    sexual_preference sexual_preference_type DEFAULT 'bi',
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

    CREATE TABLE user_interactions
    (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        target_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        interaction_type VARCHAR(10) NOT NULL CHECK (interaction_type IN ('like', 'dislike')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (user_id, target_user_id)
    );

    CREATE TABLE blocks
    (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        blocked_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (user_id, blocked_id)
    );
    CREATE TABLE reports
    (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        reported_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (user_id, reported_id)
    );
    CREATE TABLE messages
    (
        id SERIAL PRIMARY KEY,
        sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        recipient_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE notifications
    (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE visits
    (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        visited_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (user_id, visited_id)
    );
    CREATE TABLE freinds_requests
    (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        requested_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (user_id, requested_id)
    );




    INSERT INTO interests
        (name)
    VALUES
        ('Music'),
        ('Movies'),
        ('Sports'),
        ('Travel'),
        ('Reading'),
        ('Cooking'),
        ('Gaming'),
        ('Photography'),
        ('Art'),
        ('Fashion'),
        ('Fitness');


    INSERT INTO users
        (
        username,
        email,
        password,
        first_name,
        last_name,
        is_verified,
        created_at
        )
    VALUES
        (
            'moha',
            'moha@moha.com',
            '111111',
            'moha',
            'bhr',
            TRUE,
            CURRENT_TIMESTAMP
    ),
        (
            'toto',
            'toto@toto.com',
            '111111',
            'toto',
            'bhr',
            TRUE,
            CURRENT_TIMESTAMP
    )
    ;