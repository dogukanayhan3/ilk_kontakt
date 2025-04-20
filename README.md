IlkKontakt App
==============

This is a full-stack web application built with:

- Backend: ABP Framework (.NET Core)
- Frontend: React
- Database: PostgreSQL (via Docker Compose)

------------------------------------------------------------

Prerequisites
-------------

- .NET 8 SDK (https://dotnet.microsoft.com/download)
- Node.js (LTS) (https://nodejs.org/)
- npm (https://www.npmjs.com/)
- Docker and Docker Compose (https://www.docker.com/)

------------------------------------------------------------

1. Setting Up the Database (PostgreSQL with Docker Compose)
-----------------------------------------------------------

1. Start the PostgreSQL container using Docker Compose:

   docker-compose up -d

   This will create and start a PostgreSQL container as defined in your docker-compose.yml.

2. Verify the container is running:

   docker ps

3. (Optional) Stop the container:

   docker-compose down

------------------------------------------------------------

2. Backend Setup (ABP)
----------------------

1. Navigate to the backend folder:

   cd Backend

2. Install ABP CLI dependencies:

   abp install-libs

3. Update your connection string in appsettings.json to match the settings in your docker-compose.yml (usually Host=localhost;Port=5432;Database=ilk_kontakt_db;Username=appuser;Password=apppassword).

4. Run database migrations (if needed):

   dotnet ef database update

5. Run the backend:

   dotnet run --project IlkKontakt.Backend.HttpApi.Host

6. Swagger UI:
   Visit http://localhost:44388/swagger (or your configured port) to view the API docs.

------------------------------------------------------------

3. Frontend Setup (React)
-------------------------

1. Navigate to the frontend folder:

   cd ../src

2. Install dependencies:

   npm install

3. Start the React app:

   HTTPS=true npm start

   The app will run on https://localhost:3000 by default.

------------------------------------------------------------

4. Notes
--------

- The angular/ folder is ignored and not required for this setup.
- Make sure your backend and frontend are configured to communicate (CORS, API URLs, etc.).
- If you change database credentials or ports, update both your docker-compose.yml and backend config.

------------------------------------------------------------

5. Troubleshooting
------------------

- If you get connection errors, ensure Docker is running and the container is healthy.
- Check that ports 5432 (Postgres), 5000 (backend), and 3000 (frontend) are not blocked or in use.
- For ABP-specific issues, see the ABP documentation: https://docs.abp.io/

