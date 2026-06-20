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

function getCustomers() {
  return state.customers;
}

function getOrders() {
  return state.orders;
}

function getVehicles() {
  return state.vehicles;
}

function getPlans() {
  return state.plans;
}

function getNextPlanNumber() {
  return state.nextPlanNumber;
}

function incrementNextPlanNumber() {
  state.nextPlanNumber += 1;
}

function resetState() {
  state = createInitialState();
  return state;
}

module.exports = {
  getCustomers,
  getOrders,
  getPlans,
  getState,
  getVehicles,
  getNextPlanNumber,
  incrementNextPlanNumber,
  resetState,
};
