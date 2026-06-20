const CREDIT_STATUS = {
  OK: "OK",
  BLOCKED: "BLOCKED",
};

const VEHICLE_STATUS_KEY = {
  AVAILABLE: "AVAILABLE",
  PLANNED: "PLANNED",
};

const VEHICLE_STATUS_LABEL_BY_KEY = {
  [VEHICLE_STATUS_KEY.AVAILABLE]: "Available",
  [VEHICLE_STATUS_KEY.PLANNED]: "Planned",
};

function getVehicleStatusKey(status) {
  if (!status) {
    return status;
  }

  if (status === VEHICLE_STATUS_KEY.AVAILABLE || status === VEHICLE_STATUS_LABEL_BY_KEY[VEHICLE_STATUS_KEY.AVAILABLE]) {
    return VEHICLE_STATUS_KEY.AVAILABLE;
  }

  if (status === VEHICLE_STATUS_KEY.PLANNED || status === VEHICLE_STATUS_LABEL_BY_KEY[VEHICLE_STATUS_KEY.PLANNED]) {
    return VEHICLE_STATUS_KEY.PLANNED;
  }

  return status;
}

function getVehicleStatusLabel(status) {
  const statusKey = getVehicleStatusKey(status);
  return VEHICLE_STATUS_LABEL_BY_KEY[statusKey] || status;
}

module.exports = {
  CREDIT_STATUS,
  VEHICLE_STATUS_KEY,
  VEHICLE_STATUS_LABEL_BY_KEY,
  getVehicleStatusKey,
  getVehicleStatusLabel,
};
