function AdminResetView({ loading, error, onRetry, onGoHome }) {
  return (
    <main className="admin-action">
      <section className="admin-action__card">
        <div className="admin-action__icon">
          <span className={`spinner ${loading ? "spinner--active" : ""}`} aria-hidden="true" />
        </div>

        <h1>{loading ? "Resetting data" : "Reset could not be completed"}</h1>
        <p className="admin-action__copy">
          {loading
            ? "Refreshing MongoDB from the JSON seed files. You will be redirected back to the dashboard automatically."
            : error}
        </p>

        {loading ? (
          <div className="admin-action__status">
            <span className="spinner spinner--small spinner--active" aria-hidden="true" />
            <span>Applying seed data and syncing the planner...</span>
          </div>
        ) : (
          <div className="admin-action__actions">
            <button type="button" className="primary-button" onClick={onRetry}>
              Retry Reset
            </button>
            <button type="button" className="secondary-button" onClick={onGoHome}>
              Back to Dashboard
            </button>
          </div>
        )}
      </section>
    </main>
  );
}

export default AdminResetView;
