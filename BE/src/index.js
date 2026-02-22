require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/swipes', require('./routes/swipes'));
app.use('/api/matches', require('./routes/matches'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/subscription', require('./routes/subscription'));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', app: 'REDATE', version: '1.0.0' });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`💕 REDATE Backend running on port ${PORT}`);
});