# Database

This folder contains the SQL scripts and initialization logic for setting up the **PostgreSQL** database used by the StudySync application. It includes the schema definition, data seeding, and a shell script to execute everything in order.

---

## 📁 Folder Structure

```
database/
└── initdb/
    ├── data/
    │   ├── Grade_Distribution.sql
    │   ├── Grades.sql
    │   ├── Tasks.sql
    │   ├── classes.sql
    │   └── semesters.sql
    ├── schema/
    │   └── Schema.sql
    └── init.sh
```

---

### 📂 `schema/`

Contains:

* `Schema.sql`: Creates tables and defines relationships.

### 📂 `data/`

Contains:

* SQL files to populate the database with initial seed data:

  * `classes.sql`
  * `semesters.sql`
  * `Tasks.sql`
  * `Grades.sql`
  * `Grade_Distribution.sql`

### 🖥 `init.sh`

Shell script used to run all SQL files in the proper order via `psql`. It:

* Loads environment variables (via `.env`)
* Executes the schema file
* Seeds the database with initial data

---

## 🚀 Usage

### 1. Prerequisites

* [PostgreSQL](https://www.postgresql.org/)
* `.env` file with credentials (used inside the Docker container or locally)

### 2. Run Initialization Script

From inside the `initdb` directory:

```bash
chmod +x init.sh
./init.sh
```

This will run all SQL scripts in the correct order.

---

## 🐳 Docker Compatibility

The paths and logic inside `init.sh` are compatible with Docker volumes typically mounted at `/docker-entrypoint-initdb.d/`. This setup is designed to work seamlessly with Docker-based PostgreSQL containers. To run the container from the root
directory:

```bash
docker-compose up database
```

---
