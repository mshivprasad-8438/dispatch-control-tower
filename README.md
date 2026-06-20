# Dispatch Control Tower

## Project Overview

This is a small full-stack dispatch planning app built for the take-home assignment. It lets a planner view available orders, assign them to vehicles, see live capacity updates, and save a plan that returns a loading sheet.

The solution uses in-memory state loaded from the provided JSON seed files. That keeps the app easy to run and review while still enforcing the required business rules correctly.

## Architecture

- `server/`
  - `Express` API
  - in-memory store loaded from `data/*.json`
  - business-rule services for credit, capacity, and plan validation
- `client/`
  - `React + Vite`
  - local state with React hooks only
  - no Redux or extra state libraries

Core backend services:

- `creditService.js`
- `capacityService.js`
- `planService.js`

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

## Run Instructions

### Option 1: Docker

From the project root:

```bash
docker compose up
```

Then open:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3001`

### Option 2: Local Node

Backend:

```bash
cd server
npm install
npm start
```

Frontend:

```bash
cd client
npm install
npm run dev
```

## Run Tests

```bash
cd server
npm test
```

## Assumptions

- Single-user flow only
- In-memory persistence is acceptable for this assignment
- Once a plan is saved, the vehicle becomes `Planned`
- Saved orders no longer appear in `GET /api/orders`
- Currency is treated as integer rupees

## Tradeoffs

- Used click/select-to-assign instead of drag-and-drop to keep the core workflow simpler and easier to validate.
- Kept persistence in memory instead of adding a database because the assignment explicitly allows it.
- Focused tests on business rules rather than broad UI coverage.

## Future Improvements

- Add drag-and-drop assignment
- Add frontend interaction tests
- Add a reset/demo endpoint for faster manual retesting
- Persist plans with a database if the assignment needed multi-session behavior
