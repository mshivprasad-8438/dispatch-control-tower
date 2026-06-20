import { useEffect, useMemo, useRef, useState } from "react";
import { getOrders, getVehicles, resetData, savePlan } from "./api";
import AdminResetView from "./components/AdminResetView";
import LoadingSheetModal from "./components/LoadingSheetModal";
import OrdersPanel from "./components/OrdersPanel";
import StatusMessage from "./components/StatusMessage";
import VehiclesPanel from "./components/VehiclesPanel";
import { VEHICLE_STATUS_KEY } from "./constants/statuses";
import {
  canAssignOrderToVehicle,
  getDraftAssignedOrderIds,
  getRemainingCapacity,
} from "./utils/capacity";

const EMPTY_TOAST = { tone: "info", message: "" };
const REDIRECT_TOAST_KEY = "dispatch-control-tower-toast";

function App() {
  const isResetRoute = window.location.pathname === "/admin/reset-data";
  const resetStartedRef = useRef(false);
  const [orders, setOrders] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [draftAssignments, setDraftAssignments] = useState({});
  const [selectedVehicleByOrder, setSelectedVehicleByOrder] = useState({});
  const [highlightedOrderId, setHighlightedOrderId] = useState("");
  const [pageLoading, setPageLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [toast, setToast] = useState(EMPTY_TOAST);
  const [adminResetState, setAdminResetState] = useState({
    loading: isResetRoute,
    error: "",
  });
  const [savingVehicleNo, setSavingVehicleNo] = useState("");
  const [loadingSheet, setLoadingSheet] = useState(null);

  useEffect(() => {
    if (!toast.message) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setToast(EMPTY_TOAST);
    }, 3000);

    return () => window.clearTimeout(timeoutId);
  }, [toast]);

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
    const savedToast = window.sessionStorage.getItem(REDIRECT_TOAST_KEY);

    if (savedToast) {
      try {
        setToast(JSON.parse(savedToast));
      } catch (error) {
        window.sessionStorage.removeItem(REDIRECT_TOAST_KEY);
      }

      window.sessionStorage.removeItem(REDIRECT_TOAST_KEY);
    }
  }, []);

  async function handleAdminReset() {
    setAdminResetState({ loading: true, error: "" });

    try {
      const response = await resetData();
      window.sessionStorage.setItem(
        REDIRECT_TOAST_KEY,
        JSON.stringify({
          tone: "success",
          message: response.message || "Database reset from seed data completed.",
        })
      );
      window.location.replace("/");
    } catch (error) {
      setAdminResetState({
        loading: false,
        error: error.message || "Could not reset data.",
      });
    }
  }

  useEffect(() => {
    if (isResetRoute) {
      if (resetStartedRef.current) {
        return;
      }

      resetStartedRef.current = true;
      handleAdminReset();
      return;
    }

    loadBoardData(true);
  }, []);

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

  function showToast(tone, message) {
    setToast({ tone, message });
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

    if (order.creditStatus === "BLOCKED") {
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
    setToast(EMPTY_TOAST);
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

  function handleRemoveOrder(vehicleNo, orderId) {
    setDraftAssignments((current) => {
      const nextOrders = (current[vehicleNo] || []).filter((order) => order.orderId !== orderId);
      const nextAssignments = { ...current, [vehicleNo]: nextOrders };

      if (nextOrders.length === 0) {
        delete nextAssignments[vehicleNo];
      }

      return nextAssignments;
    });

    showToast("success", `${orderId} removed from ${vehicleNo}.`);
  }

  async function handleSavePlan(vehicleNo) {
    const draftOrders = draftAssignments[vehicleNo] || [];

    if (draftOrders.length === 0) {
      showToast("error", "Add at least one order before saving a plan.");
      return;
    }

    setSavingVehicleNo(vehicleNo);

    try {
      const response = await savePlan({
        vehicleNo,
        orderIds: draftOrders.map((order) => order.orderId),
      });

      setLoadingSheet(response.data);
      showToast("success", `Plan ${response.data.planId} saved successfully.`);
      setDraftAssignments((current) => {
        const nextAssignments = { ...current };
        delete nextAssignments[vehicleNo];
        return nextAssignments;
      });
      await loadBoardData(false);
    } catch (error) {
      showToast("error", error.message);
    } finally {
      setSavingVehicleNo("");
    }
  }

  if (isResetRoute) {
    return (
      <AdminResetView
        loading={adminResetState.loading}
        error={adminResetState.error}
        onRetry={handleAdminReset}
        onGoHome={() => window.location.replace("/")}
      />
    );
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

        <StatusMessage
          tone={toast.tone}
          message={toast.message}
          floating
          onClose={() => setToast(EMPTY_TOAST)}
        />

        <div className="board-layout">
          <OrdersPanel
            orders={visibleOrders}
            availableVehicles={availableVehicles}
            draftAssignments={draftAssignments}
            selectedVehicleByOrder={selectedVehicleByOrder}
            highlightedOrderId={highlightedOrderId}
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
