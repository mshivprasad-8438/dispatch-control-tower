const customers = require("../../../data/customers.json");
const orders = require("../../../data/orders.json");
const vehicles = require("../../../data/vehicles.json");

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function createInitialState() {
  return {
    customers: clone(customers),
    orders: clone(orders),
    vehicles: clone(vehicles),
    plans: [],
    nextPlanNumber: 1,
  };
}

let state = createInitialState();

function getState() {
  return state;
}

function resetState() {
  state = createInitialState();
  return state;
}

module.exports = {
  getState,
  resetState,
};
