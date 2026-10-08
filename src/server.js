require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/database');

const PORT = process.env.PORT || 4000;

// Connect to Database first, then start listening
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Job Board API running on http://localhost:${PORT}`);
  });
}).catch((err) => {
  console.error('Failed to start server due to database connection error:', err);
  process.exit(1);
});
