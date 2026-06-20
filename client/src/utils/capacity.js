export function getDraftOrdersForVehicle(draftAssignments, vehicleNo) {
  return draftAssignments[vehicleNo] || [];
}

export function getDraftLoad(draftAssignments, vehicleNo) {
  return getDraftOrdersForVehicle(draftAssignments, vehicleNo).reduce(
    (sum, order) => sum + order.qtyMT,
    0
  );
}

export function getVehicleLoadedMT(vehicle, draftAssignments) {
  return (vehicle.currentLoadedMT || 0) + getDraftLoad(draftAssignments, vehicle.vehicleNo);
}

export function getRemainingCapacity(vehicle, draftAssignments) {
  return vehicle.capacityMT - getVehicleLoadedMT(vehicle, draftAssignments);
}

export function canAssignOrderToVehicle(vehicle, order, draftAssignments) {
  return getRemainingCapacity(vehicle, draftAssignments) >= order.qtyMT;
}

export function getDraftAssignedOrderIds(draftAssignments) {
  return new Set(
    Object.values(draftAssignments)
      .flat()
      .map((order) => order.orderId)
  );
}
