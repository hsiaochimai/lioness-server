CREATE TABLE roles (
    id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
    title TEXT NOT NULL
);
CREATE TABLE project_statuses (
    id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
    title TEXT NOT NULL
);
CREATE TABLE users (
    id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role_id INTEGER REFERENCES roles(id) NOT NULL,
    phone VARCHAR NOT NULL,
    password VARCHAR NOT NULL,
    inactive boolean NOT NULL

);

CREATE TABLE projects (
	id INTEGER PRIMARY KEY NOT NULL GENERATED BY DEFAULT AS IDENTITY,
	title text NOT NULL,
	description text NOT NULL,
	budget float8 NOT NULL,
	start_date timestamptz NOT NULL,
	estimated_due_date timestamptz NULL,
	completion_date timestamptz NULL,
	manager_id int REFERENCES users(id) NOT NULL,
	client_id int REFERENCES users(id) NOT NULL,
	status_id int REFERENCES project_statuses(id) NOT NULL
);

CREATE TABLE contractors_projects (
    contractor_id int REFERENCES users(id) NOT NULL,
    project_id int REFERENCES projects(id) NOT NULL,
    CONSTRAINT contractors_projects_pkey
     PRIMARY KEY (contractor_id, project_id)
);

-- CREATE TABLE clients_projects (
--     client_id int REFERENCES users(id) NOT NULL,
--     project_id int REFERENCES projects(id) NOT NULL,
--      CONSTRAINT clients_projects_pkey
--      PRIMARY KEY (client_id, project_id)
-- );
-- CREATE TABLE project_managers_projects (
--     project_manager_id int REFERENCES users(id) NOT NULL,
--     project_id int REFERENCES projects(id) NOT NULL,
--     CONSTRAINT project_managers_projects_pkey
--      PRIMARY KEY (project_manager_id, project_id)
-- );




