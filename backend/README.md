# Backend

This folder contains the backend of the **StudySync** application, responsible for API logic, server-side operations, and communication with the database.

---

## 📁 Folder Structure

```
backend/
├── Dockerfile
├── package.json
├── package-lock.json
├── src/
│   ├── index.js          # Entry point for backend server
│   ├── controllers/      # Functions handling application logic
│   ├── routes/           # Express routes for various API endpoints
│   └── utils/            # Utility functions (e.g., database manager, logger)
```

---

## 🚀 Getting Started

### Prerequisites

* [Node.js](https://nodejs.org/en/) (v14 or higher)
* [npm](https://www.npmjs.com/)
* A PostgreSQL database

---

### 🛠 Installation

1. Navigate to the backend directory:

```bash
cd backend
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the `backend/` folder.

---

### ▶️ Running the Server

To start the development server:

```bash
npm run start
```

By default, it runs at `http://localhost:3001`.

---

## 🐳 Docker

To build and run the backend in a Docker container (root directory):

```bash
docker-compose up backend
```

---

## 📄 License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT).

---
