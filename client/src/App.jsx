import { useEffect, useMemo, useState } from "react";
import { getOrders, getVehicles, savePlan } from "./api";
import LoadingSheetModal from "./components/LoadingSheetModal";
import OrdersPanel from "./components/OrdersPanel";
import StatusMessage from "./components/StatusMessage";
import VehiclesPanel from "./components/VehiclesPanel";
import {
  canAssignOrderToVehicle,
  getDraftAssignedOrderIds,
  getRemainingCapacity,
} from "./utils/capacity";

function App() {
  const [orders, setOrders] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [draftAssignments, setDraftAssignments] = useState({});
  const [selectedVehicleByOrder, setSelectedVehicleByOrder] = useState({});
  const [pageLoading, setPageLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [banner, setBanner] = useState({ tone: "info", message: "" });
  const [savingVehicleNo, setSavingVehicleNo] = useState("");
  const [loadingSheet, setLoadingSheet] = useState(null);

  async function loadBoardData(showLoading = false) {
    if (showLoading) {
      setPageLoading(true);
    }

    try {
      const [ordersResponse, vehiclesResponse] = await Promise.all([getOrders(), getVehicles()]);
      setOrders(ordersResponse.data);
      setVehicles(vehiclesResponse.data);
      setPageError("");
    } catch (error) {
      setPageError(error.message);
    } finally {
      if (showLoading) {
        setPageLoading(false);
      }
    }
  }

  useEffect(() => {
    loadBoardData(true);
  }, []);

  const availableVehicles = useMemo(
    () => vehicles.filter((vehicle) => vehicle.status === "Available"),
    [vehicles]
  );

  const visibleOrders = useMemo(() => {
    const draftAssignedOrderIds = getDraftAssignedOrderIds(draftAssignments);
    return orders.filter((order) => !draftAssignedOrderIds.has(order.orderId));
  }, [draftAssignments, orders]);

  function handleVehicleChange(orderId, vehicleNo) {
    setSelectedVehicleByOrder((current) => ({
      ...current,
      [orderId]: vehicleNo,
    }));
  }

  function handleAssign(order) {
    const selectedVehicleNo = selectedVehicleByOrder[order.orderId];

    if (!selectedVehicleNo) {
      setBanner({ tone: "error", message: "Select a vehicle before assigning the order." });
      return;
    }

    if (order.creditStatus === "BLOCKED") {
      setBanner({ tone: "error", message: order.creditReason });
      return;
    }

    const vehicle = vehicles.find((item) => item.vehicleNo === selectedVehicleNo);

    if (!vehicle || vehicle.status !== "Available") {
      setBanner({ tone: "error", message: "Selected vehicle is not available." });
      return;
    }

    if (!canAssignOrderToVehicle(vehicle, order, draftAssignments)) {
      const remainingCapacity = getRemainingCapacity(vehicle, draftAssignments);
      setBanner({
        tone: "error",
        message: `Cannot assign ${order.orderId}. ${vehicle.vehicleNo} has only ${remainingCapacity} MT remaining.`,
      });
      return;
    }

    setDraftAssignments((current) => ({
      ...current,
      [selectedVehicleNo]: [...(current[selectedVehicleNo] || []), order],
    }));
    setSelectedVehicleByOrder((current) => ({
      ...current,
      [order.orderId]: "",
    }));
    setBanner({ tone: "success", message: `${order.orderId} added to ${selectedVehicleNo}.` });
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

    setBanner({ tone: "success", message: `${orderId} removed from ${vehicleNo}.` });
  }

  async function handleSavePlan(vehicleNo) {
    const draftOrders = draftAssignments[vehicleNo] || [];

    if (draftOrders.length === 0) {
      setBanner({ tone: "error", message: "Add at least one order before saving a plan." });
      return;
    }

    setSavingVehicleNo(vehicleNo);

    try {
      const response = await savePlan({
        vehicleNo,
        orderIds: draftOrders.map((order) => order.orderId),
      });

      setLoadingSheet(response.data);
      setBanner({ tone: "success", message: `Plan ${response.data.planId} saved successfully.` });
      setDraftAssignments((current) => {
        const nextAssignments = { ...current };
        delete nextAssignments[vehicleNo];
        return nextAssignments;
      });
      await loadBoardData(false);
    } catch (error) {
      setBanner({ tone: "error", message: error.message });
    } finally {
      setSavingVehicleNo("");
    }
  }

  return (
    <>
      <main className="app-shell">
        <header className="page-header">
          <div>
            <h1>Dispatch Control Tower</h1>
            <p>Assign open orders to available vehicles and save a loading sheet.</p>
          </div>
        </header>

        <StatusMessage tone={banner.tone} message={banner.message} />

        <div className="board-layout">
          <OrdersPanel
            orders={visibleOrders}
            availableVehicles={availableVehicles}
            selectedVehicleByOrder={selectedVehicleByOrder}
            onVehicleChange={handleVehicleChange}
            onAssign={handleAssign}
            loading={pageLoading}
            error={pageError}
          />

          <VehiclesPanel
            vehicles={vehicles}
            draftAssignments={draftAssignments}
            onRemoveOrder={handleRemoveOrder}
            onSavePlan={handleSavePlan}
            savingVehicleNo={savingVehicleNo}
            loading={pageLoading}
            error={pageError}
          />
        </div>
      </main>

      <LoadingSheetModal loadingSheet={loadingSheet} onClose={() => setLoadingSheet(null)} />
    </>
  );
}

export default App;
