CREATE TABLE users (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT,
    email TEXT UNIQUE NOT NULL,
    role_id INTEGER NOT NULL REFERENCES rolesDT(role_id),
    organization_id INTEGER REFERENCES organizationsDT(organization_id),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE rolesDT (
	role_id INTEGER PRIMARY KEY AUTOINCREMENT,
	role_name TEXT UNIQUE NOT NULL
);

CREATE TABLE organizationsDT (
	organization_id INTEGER PRIMARY KEY AUTOINCREMENT,
	organization_name TEXT UNIQUE NOT NULL
);

CREATE TABLE profiles (
    profile_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(user_id),
    profile_image_url TEXT,
    headline TEXT
);

CREATE TABLE posts (
    post_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(user_id),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE post_likes (
    user_id INTEGER REFERENCES users(user_id),
    post_id INTEGER REFERENCES posts(post_id),
    PRIMARY KEY (user_id, post_id)
);


CREATE TABLE comments (
    comment_id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id INTEGER NOT NULL REFERENCES posts(post_id),
    comment_owner INTEGER NOT NULL REFERENCES users(user_id),
    parent_comment_id INTEGER REFERENCES comments(comment_id),
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE notifications (
    notification_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(user_id),
    type_id INTEGER NOT NULL REFERENCES notification_typesDT(type_id),
    title TEXT,
    content TEXT,
    is_read INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE notification_typesDT (
    type_id INTEGER PRIMARY KEY AUTOINCREMENT,
    type_name TEXT UNIQUE NOT NULL
);

CREATE TABLE jobs (
    job_id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    company TEXT,
    description TEXT,
    location_id INTEGER REFERENCES job_locationsDT(location_id),
    experience_id INTEGER REFERENCES job_experiencesDT(experience_id),
    salary TEXT,
    type_id INTEGER REFERENCES job_typesDT(type_id)
);

CREATE TABLE job_typesDT (
    type_id INTEGER PRIMARY KEY AUTOINCREMENT,
    type_name TEXT UNIQUE NOT NULL
);

CREATE TABLE job_locationsDT (
    location_id INTEGER PRIMARY KEY AUTOINCREMENT,
    location_name TEXT UNIQUE NOT NULL
);

CREATE TABLE job_experiencesDT (
    experience_id INTEGER PRIMARY KEY AUTOINCREMENT,
    experience_name TEXT UNIQUE NOT NULL
);

CREATE TABLE social_connections (
    connection_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id_sender INTEGER NOT NULL REFERENCES users(user_id),
    user_id_receiver INTEGER NOT NULL REFERENCES users(user_id),
    status_id INTEGER NOT NULL REFERENCES social_connection_statusesDT(status_id),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id_sender, user_id_receiver)
);

CREATE TABLE social_connection_statusesDT (
	status_id INTEGER PRIMARY KEY AUTOINCREMENT,
	status_name TEXT UNIQUE NOT NULL DEFAULT 'pending'
);


CREATE TABLE courses (
    course_id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    course_image_url TEXT,
    description TEXT,
    instructor_id INTEGER REFERENCES instructors(instructor_id),
    duration TEXT,
    level_id INTEGER REFERENCES course_levelsDT(level_id),
    price TEXT
);

CREATE TABLE course_levelsDT (
    level_id INTEGER PRIMARY KEY AUTOINCREMENT,
    level_name TEXT UNIQUE NOT NULL
);

CREATE TABLE instructors (
	instructor_id INTEGER PRIMARY KEY AUTOINCREMENT,
	user_id INTEGER UNIQUE NOT NULL REFERENCES users(user_id),
	title TEXT NOT NULL
);

CREATE TABLE enrollments (
    enrollment_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(user_id),
    course_id INTEGER NOT NULL REFERENCES courses(course_id),
    enrolled_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE contact_us_contacts (
	contact_id INTEGER PRIMARY KEY AUTOINCREMENT,
	name TEXT NOT NULL,
	email TEXT NOT NULL CHECK (email LIKE '%@%.%'),
	message TEXT
);

CREATE TABLE projects (
    project_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

