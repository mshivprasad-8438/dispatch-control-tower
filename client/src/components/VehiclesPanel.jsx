import VehicleCard from "./VehicleCard";
import { getDraftLoad, getDraftOrdersForVehicle } from "../utils/capacity";

function VehiclesPanel({ vehicles, draftAssignments, onRemoveOrder, onSavePlan, savingVehicleNo, loading, error }) {
  if (loading) {
    return <section className="panel">Loading vehicles...</section>;
  }

  if (error) {
    return <section className="panel panel--error">Failed to load vehicles: {error}</section>;
  }

  if (vehicles.length === 0) {
    return <section className="panel">No vehicles available.</section>;
  }

  return (
    <section className="panel">
      <div className="panel__header">
        <h2>Vehicles</h2>
        <span>{vehicles.length} vehicles</span>
      </div>

      <div className="vehicle-grid">
        {vehicles.map((vehicle) => (
          <VehicleCard
            key={vehicle.vehicleNo}
            vehicle={vehicle}
            draftOrders={getDraftOrdersForVehicle(draftAssignments, vehicle.vehicleNo)}
            loadedMT={getDraftLoad(draftAssignments, vehicle.vehicleNo)}
            onRemoveOrder={onRemoveOrder}
            onSavePlan={onSavePlan}
            saving={savingVehicleNo === vehicle.vehicleNo}
          />
        ))}
      </div>
    </section>
  );
}

export default VehiclesPanel;
