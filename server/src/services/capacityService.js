function getTotalPlannedQuantity(orders) {
  return orders.reduce((total, order) => total + order.qtyMT, 0);
}

function exceedsVehicleCapacity(orders, vehicle) {
  return getTotalPlannedQuantity(orders) > vehicle.capacityMT;
}

module.exports = {
  getTotalPlannedQuantity,
  exceedsVehicleCapacity,
};
