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
    role INTEGER REFERENCES roles(id) NOT NULL,
    phone INTEGER NOT NULL
    
);

CREATE TABLE projects (
	id INTEGER PRIMARY KEY NOT NULL GENERATED BY DEFAULT AS IDENTITY,
	title text NOT NULL,
	description text NOT NULL,
	budget int NOT NULL,
	start_date date NOT NULL,
	estimated_due_date date NULL,
	completion_date date NULL,
	status int NOT NULL,
	project_manager int REFERENCES users(id) NOT NULL,
	client int REFERENCES users(id) NOT NULL
);

CREATE TABLE contractors_projects (
    contractor_id int REFERENCES users(id) NOT NULL,
    project_id int REFERENCES projects(id) NOT NULL,
    CONSTRAINT contractors_projects_pkey
     PRIMARY KEY (contractor_id, project_id)
);

-- CREATE TABLE clients_projects (
--     client_id int REFERENCES users(id) NOT NULL,
--     project_id int REFERENCES projects(id) NOT NULL
-- );
-- CREATE TABLE project_managers_projects (
--     project_manager_id int REFERENCES users(id) NOT NULL,
--     project_id int REFERENCES projects(id) NOT NULL
-- );



