const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const PORT = 5000;

// ✅ Middleware
app.use(cors());
app.use(bodyParser.json());

// ✅ Routes
const authRoutes = require('./routes/auth');
const statsRoutes = require('./routes/stats');
const kycRoutes = require('./routes/Verification');
const linksRouter = require('./routers/links');
const merchantRoutes = require('./routers/merchant');
const paymentRoutes = require('./routers/payments'); // Make sure this file exists
const { authMiddleware } = require('./middleware/auth');

// ✅ Route Usage
app.use('/api/auth', authRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/Verification', kycRoutes);
app.use('/api/links', linksRouter);
app.use('/api/merchant', merchantRoutes);
app.use('/api/pay', authMiddleware, paymentRoutes); // Protected route

// ✅ Start Server
app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});
