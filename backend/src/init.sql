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


-- INSERT INTO users (
--     username,
--     profile_picture,
--     email,
--     password,
--     first_name,
--     last_name,
--     refresh_token,
--     is_verified,
--     is_authenticated,
--     bio,
--     rating,
--     gender,
--     sexual_preference,
--     latitude,
--     longitude,
--     location,
--     created_at
-- ) VALUES
--     (
--         'user1',
--         'https://example.com/images/user1.jpg',
--         'user1@example.com',
--         'hashedpassword1',
--         'John',
--         'Doe',
--         NULL,
--         TRUE,
--         TRUE,
--         'Just a regular user within 5 km.',
--         5,
--         'male',
--         'bi',
--         32.8799012,  -- within 5 km
--         -6.8889012,  -- within 5 km
--         ST_SetSRID(ST_MakePoint(-6.8889012, 32.8799012), 4326),
--         CURRENT_TIMESTAMP
--     ),
--     (
--         'user2',
--         'https://example.com/images/user2.jpg',
--         'user2@example.com',
--         'hashedpassword2',
--         'Jane',
--         'Doe',
--         NULL,
--         TRUE,
--         TRUE,
--         'Another user within 5 km.',
--         4,
--         'female',
--         'male',
--         32.8821012,  -- within 5 km
--         -6.8905012,  -- within 5 km
--         ST_SetSRID(ST_MakePoint(-6.8905012, 32.8821012), 4326),
--         CURRENT_TIMESTAMP
--     ),
--     (
--         'user3',
--         'https://example.com/images/user3.jpg',
--         'user3@example.com',
--         'hashedpassword3',
--         'Alice',
--         'Smith',
--         NULL,
--         FALSE,
--         TRUE,
--         'Central user, reference point.',
--         3,
--         'female',
--         'bi',
--         32.8781073,  -- central location
--         -6.8894012,  -- central location
--         ST_SetSRID(ST_MakePoint(-6.8894012, 32.8781073), 4326),
--         CURRENT_TIMESTAMP
--     ),
--     (
--         'user4',
--         'https://example.com/images/user4.jpg',
--         'user4@example.com',
--         'hashedpassword4',
--         'Bob',
--         'Brown',
--         NULL,
--         TRUE,
--         FALSE,
--         'User within 10 km.',
--         4,
--         'male',
--         'female',
--         32.8972012,  -- 6.5 km away
--         -6.8937012,  -- 6.5 km away
--         ST_SetSRID(ST_MakePoint(-6.8937012, 32.8972012), 4326),
--         CURRENT_TIMESTAMP
--     ),
--     (
--         'user5',
--         'https://example.com/images/user5.jpg',
--         'user5@example.com',
--         'hashedpassword5',
--         'Charlie',
--         'Green',
--         NULL,
--         FALSE,
--         TRUE,
--         'Another user within 10 km.',
--         5,
--         'male',
--         'female',
--         32.9073012,  -- 9 km away
--         -6.8951012,  -- 9 km away
--         ST_SetSRID(ST_MakePoint(-6.8951012, 32.9073012), 4326),
--         CURRENT_TIMESTAMP
--     );
