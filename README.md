# StudySync

## Overview

**StudySync** is a  web application designed to assist students in organizing their academic responsibilities. By integrating grade and assignment tracking into a unified platform, StudySync aims to enhance student productivity and time management.

## Features

- **Task Management**: Create, update, and reprioritize schoolwork tasks.
- **Assignment Tracking**: Monitor assignment deadlines, set reminders, and mark tasks as completed.
- **Grade Tracking**: Input grades, view class progress, what-if calculator
- **User Authentication**: Secure sign-in through Google to protect personal data.

## Technologies Used

- **Frontend**: React, HTML, CSS, JavaScript, MaterialUI
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL
- **Version Control**: Git
- **Containerization**: Docker

## Installation

To set up StudySync locally, follow these steps:

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/justin2213/StudySync.git
   cd StudySync
   ```

2. **Set Up Environment Variables**:
   - Create a `.env` file in each direcoty

3. **Install Dependencies**:
   - **Backend**:
     ```bash
     cd backend
     npm install
     ```
   - **Frontend**:
     ```bash
     cd ../frontend
     npm install
     ```

4. **Start the Application**:
   - **Using Docker - Preferred**:
     ```bash
     docker-compose up
     ```
   - **Without Docker**:
     - Start the backend server:
       ```bash
       cd backend
       npm start
       ```
     - Start the frontend development server:
       ```bash
       cd ../frontend
       npm start
       ```
