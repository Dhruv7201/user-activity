# Employee Monitoring System with FastAPI Backend and React Frontend

This project is a comprehensive Employee Monitoring System with a FastAPI backend and a React frontend. The backend is responsible for tracking employee activity, including active windows, duration, and periodic screenshots. The frontend provides an administrative interface for report generation and real-time monitoring.

## Features

- **Employee Activity Tracking**: Monitors active windows and their duration.
- **Screenshot Capture**: Takes screenshots every hour of user-specific time.
- **Admin Dashboard**: React-based interface for report generation and real-time monitoring.
- **Dockerized Deployment**: Easily deployable with Docker Compose.

## Usage

1. Ensure you have Docker installed on your system.

```bash
    docker -v
```

2. Clone the repository:

```bash
   git clone https://github.com/Dhruv7201/user-activity.git
```

3. Navigate to the project directory:

```bash
    cd user-activity
```

4. Run the project using Docker Compose:

```bash
    docker-compose up --build
```

5. Access the frontend at `http://localhost:3000`.

6. Monitor employee activity and generate reports from the admin dashboard.

## Contributors

- [Dhruv modi](www.github.com/Dhruv7201)

