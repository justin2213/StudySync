# Frontend

This directory contains the frontend for **StudySync**, a web application designed to help students collaborate and stay organized while studying.

## 📁 Folder Structure

```
frontend/
├── Dockerfile
├── package.json
├── package-lock.json
├── public/
│   ├── favicon.ico
│   ├── index.html
│   ├── logo192.png
│   ├── logo512.png
│   ├── manifest.json
│   └── robots.txt
├── src/
│   ├── App.jsx
│   ├── index.jsx
│   ├── logo.svg
│   ├── logoMaster.svg
│   ├── cardBackgrounds/
│   ├── components/
│   ├── fonts/
│   ├── pages/
│   └── styles/
```

### 🔹 Key Directories

* `public/`: Static assets and the HTML template.
* `src/`: Source code including:
  * `components/`: Reusable UI components.
  * `pages/`: Main views for the app.
  * `styles/`: CSS files.
  * `fonts/`: Custom fonts used in the app.
  * `cardBackgrounds/`: Background images for class cards.

---

## 🚀 Getting Started

### Prerequisites

* [Node.js](https://nodejs.org/) (v14 or newer)
* npm

### Installation

```bash
cd frontend
npm install
```

### Running the App

```bash
npm run start
```

Visit [http://localhost:3000](http://localhost:3000) to view the app in your browser.

---

## 🐳 Docker Support

To build and run the frontend using Docker (Root directory):

```bash
docker-compose up frontend
```
--- 

## 📄 License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT).

---

