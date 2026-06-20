# Functional Spec & Acceptance Criteria

Read [`README.md`](./README.md) first. This is the precise "what to build."

Split into **A. Core (required)** and **B. Stretch (optional)**. Build A well before touching B.

---

## Domain glossary (just enough)

| Term | Meaning |
|------|---------|
| **Order** | A customer's request for some quantity (in **MT**, metric tonnes) of one product. |
| **Vehicle** | A truck with a fixed **capacity** in MT. Only `Available` trucks can be loaded. |
| **Customer** | Has a **credit limit** (₹) and **credit days**, plus an **outstanding balance** and an **oldest overdue invoice age**. |
| **Credit-blocked** | A customer you may not ship to right now. Their orders are locked. |
| **Plan** | An assignment of one or more orders to one vehicle. |
| **Loading Sheet** | The output of saving a plan: which orders/products/quantities go on which truck. |

All quantities are MT. Treat currency as plain integer rupees.

---

# A. Core requirements (required)

### Backend — API

**AR-1 — Serve orders.** `GET /api/orders` returns the open (unassigned) orders, each with a computed **credit status** (`OK` / `BLOCKED`) and, when blocked, a readable **reason** (e.g. `"Outstanding ₹540000 exceeds credit limit ₹500000"`). Credit status is derived **on the server** — the seed files don't contain it.

**AR-2 — Serve vehicles.** `GET /api/vehicles` returns vehicles with `vehicleNo`, `capacityMT`, `status`.

**AR-3 — Credit rules (server-side).** A customer is **BLOCKED** if **either**:
- `outstandingBalance > creditLimit`, **or**
- `oldestOverdueInvoiceDays > creditDays`.

Otherwise `OK`.

**AR-4 — Save a plan.** `POST /api/plans` accepts a vehicle + the orders assigned to it. The server **validates** and rejects (4xx + message) if:
- any order belongs to a **credit-blocked** customer, or
- the **sum of order quantities exceeds vehicle capacity**, or
- the vehicle isn't `Available`, or an id doesn't exist.

On success (201) it returns the saved plan **including a Loading Sheet** (plan id, vehicle, line items with order id + product + qty, total loaded vs capacity). After saving, those orders no longer appear in `GET /api/orders` and the vehicle is no longer `Available`. In-memory persistence is fine.

**AR-5 — Errors.** Bad input returns a 4xx with a JSON error body — never a 500/stack trace.

### Frontend — Control Tower

**FR-1 — Two-panel board.** An **Unassigned Orders** panel and an **Active Plan** area of **Vehicle cards**, loaded from the API.

**FR-2 — Order card** shows at least: **Customer Name, Destination, Quantity (MT), Order ID**.

**FR-3 — Assign an order to a vehicle.** Drag-and-drop is **preferred**; a clean click/select-to-assign is an acceptable fallback if drag-and-drop is out of your time budget (note it in your README). Assigned orders leave Unassigned and appear on the vehicle card.

**FR-4 — Live capacity.** Each vehicle card shows a **Loaded / Total** indicator (progress bar ideal) that updates as orders are added/removed.

**FR-5 — Overload prevention.** If an assignment would exceed capacity, **block the commit** and tell the user why.

**FR-6 — Credit-blocked orders** are **visually distinct (red border + lock)** and **cannot be assigned**; show the **reason** on hover/tap.

**FR-7 — Remove from plan.** Remove an assigned order, returning it to Unassigned and freeing capacity.

**FR-8 — Save Plan** posts to the backend and shows the returned **Loading Sheet** on success; surfaces server validation errors gracefully.

**FR-9 — UX states.** Handle loading, empty, and error states — no white-screen on an API failure.

---

# B. Stretch goals (optional — only after core is solid)

Pick what interests you; tell us in your README which you attempted. Quality over quantity.

- **SG-1 Split order.** If a drop would overload a truck, offer to **split**: load what fits; the remainder returns to Unassigned as a child order. (Backend supports partial quantities.)
- **SG-2 Persistence.** Back the API with **SQLite** (Prisma/Knex/better-sqlite3) + a seed script, instead of in-memory.
- **SG-3 Tests.** A few meaningful tests on the **business rules** (credit block, overload). These count for a lot relative to size.

---

## Worked examples (use these to self-check)

Using the provided seed data:

1. **Credit block (over limit).** `Sri Lakshmi Aqua Farms` — outstanding ₹540,000 > limit ₹500,000 → order **O-5003** is **BLOCKED** / un-assignable.
2. **Credit block (overdue).** `Krishna Delta Feeds` — oldest overdue 40 days > credit days 30 → **O-5006** **BLOCKED**.
3. **Healthy assign.** `O-5001` (Godavari, 12 MT) onto `AP28T-7457` (20 MT) → OK, bar shows **12/20**.
4. **Overload.** Adding `O-5010` (Godavari, 10 MT) to the same truck → 22 > 20 → **blocked** (or split, if you did SG-1).
5. **Save → Loading Sheet.** Saving `O-5001` on `AP28T-7457` returns a Loading Sheet showing that line and **12 / 20 MT**; afterward `O-5001` is gone from `GET /api/orders`.

Reproduce these five and your core is in good shape.

---

## Assumptions you can safely make
- Single planner (no concurrency needed).
- One product per order.
- No authentication required.
- You may reshape the seed JSON into your own schema — keep the data and rules intact.
