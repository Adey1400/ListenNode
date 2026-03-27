

🎧 ListenNode: Acoustic Machine Fault Detection
Predictive Maintenance Through Edge Computing and AI Acoustics.

ListenNode is a real-time IoT and full-stack ecosystem designed to detect mechanical failures before they happen. By capturing raw audio streams directly from industrial machines, our AI categorizes acoustic anomalies (like grinding, rattling, or sudden silence) and alerts operators via a live web dashboard with sub-second latency.

🏗️ System Architecture
ListenNode operates on a decoupled, microservice-inspired architecture to ensure maximum speed and reliability:

The Edge (ESP32 + I2S Mic): Sits on the physical machine, capturing audio and streaming raw byte arrays over the local network.

The Traffic Controller (Spring Boot): The central nervous system. It receives raw audio chunks, orchestrates the AI analysis, stores historical logs, and broadcasts live events.

The Brain (AI Microservice): A lightweight Python/Express service utilizing YAMNet & TensorFlow to extract audio embeddings and classify machine health.

The Command Center (React.js): A real-time dashboard powered by WebSockets, featuring live visual alerts, confidence gauges, and historical degradation charts.

✨ Key Features
⚡ Real-Time WebSocket Streaming: Instant visual alerts on the frontend the millisecond a fault is detected—no page refreshing required.

🔒 JWT-Secured Architecture: Fully authenticated REST APIs and database layers ensuring industrial data remains private.

📊 Historical Analytics: Persistent data logging in PostgreSQL allows managers to track acoustic degradation trends over time.

🛑 "Sudden Death" Detection: Bypasses heavy AI processing for critical volume thresholds (e.g., sudden silence or loud impacts) for instant offline alerting.

🛠️ Built-in Mocking Engine: Includes an automated data-simulation scheduler to test the UI and database flow independently of the hardware layer.

💻 Tech Stack
Backend: Java 17, Spring Boot 3, Spring Web, Spring WebSockets

Security: Spring Security, JSON Web Tokens (JWT)

Database: PostgreSQL, Spring Data JPA, Hibernate

Frontend: React.js, Tailwind CSS (Dark Mode UI)

Edge / Hardware: ESP32, INMP441 Microphone, C/C++

AI / Machine Learning: Python/Node, TensorFlow, YAMNet

🚀 Getting Started (Backend Setup)
If you are cloning this repository to run the backend locally, follow these steps:

1. Prerequisites
Java 17 or higher

PostgreSQL installed and running (pgAdmin recommended)

Maven

2. Database Configuration
Open pgAdmin and create a new, blank database named exactly: ListenNode

In the project folder, navigate to src/main/resources/.

Locate application.properties.example and rename it to application.properties.

Open the file and update your database credentials:

Properties
spring.datasource.username=postgres
spring.datasource.password=YOUR_LOCAL_PASSWORD
(Note: Hibernate ddl-auto=update is enabled. Spring Boot will automatically generate the required SQL tables upon the first run).

3. Running the Application
Open your terminal in the root directory of the backend project and run:

Bash
./mvnw spring-boot:run
The server will start on http://localhost:8080.

📂 Core Database Entities
User: Manages dashboard authentication credentials and profile data.

Machine: Represents the physical hardware nodes being monitored.

MachineLog: Tracks the continuous stream of AI predictions, timestamps, and confidence scores linked to specific machines.

