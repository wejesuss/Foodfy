DROP SCHEMA public CASCADE;
CREATE SCHEMA public;

DROP DATABASE IF EXISTS foodfy;
CREATE DATABASE foodfy;

CREATE TABLE "files" (
  "id" SERIAL PRIMARY KEY,
  "name" text,
  "path" text NOT NULL
);
CREATE TABLE "users" (
  "id" SERIAL PRIMARY KEY,
  "name" text NOT NULL,
  "email" text UNIQUE NOT NULL,
  "password" text NOT NULL,
  "is_admin" BOOLEAN NOT NULL DEFAULT false,
  "created_at" timestamp DEFAULT (now()),
  "updated_at" timestamp DEFAULT (now()),
  "reset_token" text,
  "reset_token_expires" text
);

CREATE TABLE "chefs" (
    "id" SERIAL PRIMARY KEY,
    "name" text NOT NULL,
    "file_id" integer,
    "created_at" timestamp DEFAULT (now()),
    "updated_at" timestamp DEFAULT (now())
);

CREATE TABLE "recipes" (
  "id" SERIAL PRIMARY KEY,
  "title" text NOT NULL,
  "chef_id" int,
  "user_id" int,
  "ingredients" text[],
  "preparation" text[],
  "information" text,
  "created_at" timestamp DEFAULT (now()),
  "updated_at" timestamp DEFAULT (now())
);

CREATE TABLE "recipe_files" (
    "id" SERIAL PRIMARY KEY,
    "recipe_id" integer,
    "file_id" integer
);

ALTER TABLE "chefs" ADD FOREIGN KEY ("file_id") REFERENCES "files" ("id");
ALTER TABLE "recipes" ADD FOREIGN KEY("chef_id") REFERENCES "chefs" ("id");
ALTER TABLE "recipe_files" ADD FOREIGN KEY ("file_id") REFERENCES "files" ("id");

-- create delete cascade
ALTER TABLE "recipes" DROP CONSTRAINT IF EXISTS recipes_user_id_fkey,
ADD CONSTRAINT recipes_user_id_fkey
FOREIGN KEY ("user_id") REFERENCES "users" ("id")
ON DELETE CASCADE;

ALTER TABLE "recipe_files" DROP CONSTRAINT IF EXISTS recipe_files_recipe_id_fkey,
ADD CONSTRAINT recipe_files_recipe_id_fkey 
FOREIGN KEY ("recipe_id") REFERENCES "recipes" ("id") 
ON DELETE CASCADE;

-- procedures
DROP TRIGGER IF EXISTS set_timestamp ON recipes;
DROP TRIGGER IF EXISTS set_timestamp ON chefs;
DROP TRIGGER IF EXISTS set_timestamp ON users;
DROP FUNCTION IF EXISTS trigger_set_timestamp;

CREATE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- UPDATE timestamp recipes
CREATE TRIGGER set_timestamp
BEFORE UPDATE ON recipes
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

-- UPDATE timestamp chefs
CREATE TRIGGER set_timestamp
BEFORE UPDATE ON chefs
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

-- UPDATE timestamp users
CREATE TRIGGER set_timestamp
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

-- connect pg simple table
CREATE TABLE "session" (
  "sid" varchar NOT NULL COLLATE "default",
	"sess" json NOT NULL,
	"expire" timestamp(6) NOT NULL
)
WITH (OIDS=FALSE);

ALTER TABLE "session" ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE;

CREATE INDEX "IDX_session_expire" ON "session" ("expire");

-- restart to run seed.js
DELETE FROM users;
DELETE FROM recipes;
DELETE FROM chefs;
DELETE FROM recipe_files;
DELETE FROM files;
DELETE FROM session;

-- restart sequence ids
ALTER SEQUENCE users_id_seq RESTART WITH 1;
ALTER SEQUENCE recipes_id_seq RESTART WITH 1;
ALTER SEQUENCE chefs_id_seq RESTART WITH 1;
ALTER SEQUENCE recipe_files_id_seq RESTART WITH 1;
ALTER SEQUENCE files_id_seq RESTART WITH 1;