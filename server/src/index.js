const { connectDatabase } = require("./config/db");
const { seedIfEmpty } = require("./services/seedService");
const app = require("./app");

const PORT = process.env.PORT || 3001;

async function startServer() {
  await connectDatabase();
  await seedIfEmpty();

  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start server", error);
  process.exit(1);
});
