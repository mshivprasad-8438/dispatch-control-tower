# Dispatch Control Tower

## Project Overview

This is a small full-stack dispatch planning app. It lets a planner view available orders, assign them to vehicles, see live capacity updates, and save a plan that returns a loading sheet.

The solution now uses MongoDB for runtime persistence, while still using the provided `data/*.json` files as the seed source. On startup, the backend seeds Mongo only when the collections are empty, so refreshes and backend restarts do not lose saved plans.

## Architecture

- `server/`
  - `Express` API
  - `MongoDB + Mongoose`
  - seed/import service that loads `data/*.json` into Mongo
  - business-rule services for credit, capacity, and plan validation
- `client/`
  - `React + Vite`
  - local state with React hooks only
  - no Redux or extra state libraries

Core backend services:

- `creditService.js`
- `capacityService.js`
- `planningService.js`
- `seedService.js`

## Business Rules

Business rules are enforced server-side.

### Credit Validation

An order is blocked when:

- `outstandingBalance > creditLimit`
- or `oldestOverdueInvoiceDays > creditDays`

Blocked orders:

- are returned by the API with `creditStatus: "BLOCKED"`
- include a readable `creditReason`
- are visually marked in the UI
- cannot be assigned in the UI
- are rejected by `POST /api/plans` even if the API is called directly

### Capacity Validation

A plan is invalid when the total quantity of selected orders exceeds the selected vehicle capacity.

### Vehicle Validation

A plan is invalid when the selected vehicle status is not `Available`.

## API Endpoints

### `GET /api/orders`

Returns open, unassigned orders with server-computed credit status.

### `GET /api/vehicles`

Returns the vehicles available to the dashboard.

### `POST /api/plans`

Creates a plan for a vehicle and returns a loading sheet.

Example request:

```json
{
  "vehicleNo": "AP28T-7457",
  "orderIds": ["O-5001"]
}
```

Example error response:

```json
{
  "message": "Vehicle capacity exceeded. Total 22 MT exceeds 20 MT."
}
```

### `POST /api/admin/reset-data`

Admin-only reset endpoint. It clears runtime Mongo data and reloads the current JSON seed files.

Required header:

```text
x-admin-reset-key: <ADMIN_RESET_KEY>
```

## Run Instructions

### Option 1: Docker

From the project root:

```bash
docker compose up
```

Then open:

- Frontend: `http://localhost:5174`
- Backend: `http://localhost:3001`
- MongoDB: `mongodb://localhost:27017`

Backend environment in Docker:

- `MONGODB_URI=mongodb://mongo:27017/dispatch-control-tower`
- `ADMIN_RESET_KEY=local-admin-reset-key`

### Option 2: Local frontend + backend, Docker Mongo

Start Mongo only:

```bash
docker compose up -d mongo
```

Backend:

```bash
cd server
npm install
MONGODB_URI=mongodb://127.0.0.1:27017/dispatch-control-tower npm start
```

Frontend:

```bash
cd client
npm install
npm run dev
```

If you want to call the admin reset endpoint locally:

```bash
curl -X POST http://localhost:3001/api/admin/reset-data \
  -H "x-admin-reset-key: local-admin-reset-key"
```

## Run Tests

```bash
cd server
npm install
npm test
```

## Assumptions

- Single-user flow only
- MongoDB is the runtime data store
- JSON seed files remain the source of truth for reset/import
- Once a plan is saved, the vehicle becomes `Planned`
- Saved orders no longer appear in `GET /api/orders`
- Currency is treated as integer rupees

## Tradeoffs

- Used click/select-to-assign instead of drag-and-drop to keep the core workflow simpler and easier to validate.
- Used a simple Mongoose model + service flow instead of repository/clean-architecture layers to keep the take-home easy to review.
- Kept the admin reset path hidden from the UI and protected only by a shared secret header, which is enough for a demo/admin utility but not a production auth model.
- Focused tests on business rules rather than broad UI coverage.

## Future Improvements

- Add drag-and-drop assignment
- Add frontend interaction tests
- Add optimistic locking or transactions if concurrent planners become a requirement
- Replace shared-secret admin reset with proper authentication/authorization
