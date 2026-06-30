supportdesk

a simple, functional support ticket management system built for the software engineering internship challenge.

technology stack
- frontend: react (vite) + plain css (no gradients, emojis, or heavy frameworks)
- backend: node.js + express
- database: sqlite
- containerization: docker + docker-compose

setup instructions

local setup (without docker)
- ensure node.js and npm are installed
- clone the repository
- database setup: sqlite creates the file automatically, no external db service is needed
- backend:
```
  cd backend
  npm install
  npm run dev
```
  (runs on localhost:3001)
- frontend:
```
  cd frontend
  npm install
  npm run dev
```
  (runs on localhost:5173)

docker setup
- ensure docker and docker-compose are installed
- from the root directory run:
```
 docker-compose up --build
```
- access the frontend at localhost:5173 and backend api at localhost:3001

production deployment (railway)
- this project is pre-configured as a monorepo for instant deployment on railway.app
- just connect your github repo to railway and it will automatically build the frontend and serve the full-stack app natively using node.js
- no configuration needed! the root package.json handles the build and start commands perfectly.

how to run tests
- the tests check for ticket creation, validation, urgent detection, and status updates
- run tests from the backend directory:
```
  cd backend
  npm run test
```

api endpoints summary
```
- post /api/tickets : create a new ticket
- get /api/tickets : list tickets with support for search, filtering, sorting, and pagination
- get /api/tickets/:id : get a single ticket's details
- patch /api/tickets/:id/status : update ticket status (open, in progress, resolved)
- delete /api/tickets/:id : delete a ticket
- get /api/tickets/customer/:email : get all tickets from a specific customer email
- get /api/dashboard : get total ticket counts and stats
```
assumptions made
- sqlite is adequate for the scale of this mini application
- no authentication or role-based access control was requested, so anyone can manage any ticket
- the ui should reflect the structure of the provided design components without straying into overly complex styling
- "urgent" detection ignores case and looks anywhere in the description text

duplicate email decision
- when a user submits a ticket with an email that already exists, the system allows the new ticket to be created.
- rather than blocking it or throwing an error, i implemented a linking approach. 
- on the ticket detail page, there is a dedicated section that queries the backend for all other tickets associated with that same email address.
- this solves the problem by grouping tickets logically, so a support agent has full context of a customer's history without stopping the customer from reporting new issues.

initiative feature explanation
- features added: full application dockerization, backend pagination.
- why selected: a professional application needs to be easily deployable, performant with large datasets. 
- what problem it solves: docker removes the "it works on my machine" problem. pagination prevents the browser and database from crashing when loading thousands of tickets.
- future improvements: i would add redis caching for the dashboard statistics, since counting all rows on every dashboard load will get slow as the database grows.

known limitations
- no file attachments on tickets
- no email notifications when status changes
- dashboard stats are calculated on the fly without caching

what i would build next
- authentication so only support agents can change status
- a robust commenting system for communication between agents and customers
- redis caching for the dashboard endpoints

time log
- planning: 30 minutes
- backend and database: 1 hour 30 minutes
- frontend: 2 hours
- testing: 1 hour 30 minutes
- documentation and polish: 1 hour
- total: 6 hours and 30 minutes

i confirm that i completed this challenge without using generative ai, an ai coding assistant, or an ai-enabled editor. i understand the submitted code and can explain and modify it.
