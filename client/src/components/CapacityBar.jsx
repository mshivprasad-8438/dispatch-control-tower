function CapacityBar({ loaded, total }) {
  const percentage = total === 0 ? 0 : Math.min((loaded / total) * 100, 100);

  return (
    <div className="capacity-block">
      <div className="capacity-label">
        <span className="meta-label">Loaded</span>
        <strong className="meta-value">
          {loaded} / {total} MT
        </strong>
      </div>
      <div className="capacity-bar">
        <div className="capacity-bar__fill" style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}

export default CapacityBar;
