import { useEffect, useRef, useState } from "react";
import { getOrders, getVehicles, resetData, savePlan } from "./api";
import AdminResetView from "./components/AdminResetView";
import useAssignments from "./hooks/useAssignments";
import LoadingSheetModal from "./components/LoadingSheetModal";
import OrdersPanel from "./components/OrdersPanel";
import StatusMessage from "./components/StatusMessage";
import VehiclesPanel from "./components/VehiclesPanel";

const EMPTY_TOAST = { tone: "info", message: "" };
const REDIRECT_TOAST_KEY = "dispatch-control-tower-toast";

function App() {
  const isResetRoute = window.location.pathname === "/admin/reset-data";
  const resetStartedRef = useRef(false);
  const [orders, setOrders] = useState([]);
  const [vehicles, setVehicles] = useState([]);
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

  function showToast(tone, message) {
    setToast({ tone, message });
  }

  const {
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
  } = useAssignments({
    orders,
    vehicles,
    showToast,
    clearToast: () => setToast(EMPTY_TOAST),
  });

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
      clearDraftAssignmentsForVehicle(vehicleNo);
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
            draggedAssignment={draggedAssignment}
            onDeleteDrop={handleDeleteDrop}
            onDragEnd={handleDragEnd}
            onDragStart={handleDragStart}
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
