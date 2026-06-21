import { useEffect, useMemo, useState } from "react";
import { CREDIT_STATUS, VEHICLE_STATUS_KEY } from "../constants/statuses";
import {
  canAssignOrderToVehicle,
  getDraftAssignedOrderIds,
  getRemainingCapacity,
} from "../utils/capacity";

function useAssignments({ orders, vehicles, showToast, clearToast }) {
  const [draftAssignments, setDraftAssignments] = useState({});
  const [selectedVehicleByOrder, setSelectedVehicleByOrder] = useState({});
  const [highlightedOrderId, setHighlightedOrderId] = useState("");
  const [draggedAssignment, setDraggedAssignment] = useState(null);

  const availableVehicles = useMemo(
    () => vehicles.filter((vehicle) => vehicle.statusKey === VEHICLE_STATUS_KEY.AVAILABLE),
    [vehicles]
  );

  const visibleOrders = useMemo(() => {
    const draftAssignedOrderIds = getDraftAssignedOrderIds(draftAssignments);
    return orders.filter((order) => !draftAssignedOrderIds.has(order.orderId));
  }, [draftAssignments, orders]);

  useEffect(() => {
    const ordersById = new Map(visibleOrders.map((order) => [order.orderId, order]));
    const vehiclesByNumber = new Map(availableVehicles.map((vehicle) => [vehicle.vehicleNo, vehicle]));

    setSelectedVehicleByOrder((current) => {
      let hasChanges = false;
      const next = {};

      for (const [orderId, vehicleNo] of Object.entries(current)) {
        const order = ordersById.get(orderId);
        const vehicle = vehiclesByNumber.get(vehicleNo);

        if (order && vehicle && canAssignOrderToVehicle(vehicle, order, draftAssignments)) {
          next[orderId] = vehicleNo;
        } else {
          hasChanges = true;
        }
      }

      return hasChanges ? next : current;
    });
  }, [availableVehicles, draftAssignments, visibleOrders]);

  function handleVehicleChange(orderId, vehicleNo) {
    if (highlightedOrderId === orderId) {
      setHighlightedOrderId("");
    }

    setSelectedVehicleByOrder((current) => ({
      ...current,
      [orderId]: vehicleNo,
    }));
  }

  function showAssignError(orderId, message) {
    setHighlightedOrderId(orderId);
    showToast("error", message);
  }

  function handleAssign(order) {
    const selectedVehicleNo = selectedVehicleByOrder[order.orderId];

    if (!selectedVehicleNo) {
      showAssignError(order.orderId, "Select a vehicle before assigning the order.");
      return;
    }

    if (order.creditStatus === CREDIT_STATUS.BLOCKED) {
      showAssignError(order.orderId, order.creditReason);
      return;
    }

    const vehicle = vehicles.find((item) => item.vehicleNo === selectedVehicleNo);

    if (!vehicle || vehicle.statusKey !== VEHICLE_STATUS_KEY.AVAILABLE) {
      showAssignError(order.orderId, "Selected vehicle is not available.");
      return;
    }

    if (!canAssignOrderToVehicle(vehicle, order, draftAssignments)) {
      const remainingCapacity = getRemainingCapacity(vehicle, draftAssignments);
      showAssignError(
        order.orderId,
        `Cannot assign ${order.orderId}. ${vehicle.vehicleNo} has only ${remainingCapacity} MT remaining.`
      );
      return;
    }

    setHighlightedOrderId("");
    clearToast();
    setDraftAssignments((current) => ({
      ...current,
      [selectedVehicleNo]: [...(current[selectedVehicleNo] || []), order],
    }));
    setSelectedVehicleByOrder((current) => ({
      ...current,
      [order.orderId]: "",
    }));
    showToast("success", `${order.orderId} added to ${selectedVehicleNo}.`);
  }

  function clearDraftAssignmentsForVehicle(vehicleNo) {
    setDraftAssignments((current) => {
      if (!current[vehicleNo]) {
        return current;
      }

      const nextAssignments = { ...current };
      delete nextAssignments[vehicleNo];
      return nextAssignments;
    });
  }

  function handleRemoveOrder(vehicleNo, orderId) {
    setDraftAssignments((current) => {
      const nextOrders = (current[vehicleNo] || []).filter((order) => order.orderId !== orderId);
      const nextAssignments = { ...current, [vehicleNo]: nextOrders };

      if (nextOrders.length === 0) {
        delete nextAssignments[vehicleNo];
      }

      return nextAssignments;
    });

    setDraggedAssignment(null);
    showToast("success", `${orderId} removed from ${vehicleNo}.`);
  }

  function handleDragStart(event, vehicleNo, order) {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", `${vehicleNo}:${order.orderId}`);
    setDraggedAssignment({
      vehicleNo,
      orderId: order.orderId,
    });
  }

  function handleDragEnd() {
    setDraggedAssignment(null);
  }

  function handleDeleteDrop() {
    if (!draggedAssignment) {
      return;
    }

    handleRemoveOrder(draggedAssignment.vehicleNo, draggedAssignment.orderId);
  }

  return {
    availableVehicles,
    clearDraftAssignmentsForVehicle,
    draftAssignments,
    draggedAssignment,
    handleAssign,
    handleDeleteDrop,
    handleDragEnd,
    handleDragStart,
    handleRemoveOrder,
    handleVehicleChange,
    highlightedOrderId,
    selectedVehicleByOrder,
    visibleOrders,
  };
}

export default useAssignments;
