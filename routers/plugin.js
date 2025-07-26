// backend/routers/plugin.js
const express = require('express');
const router = express.Router();

// GET /api/plugin/download
router.get('/download', (req, res) => {
  const file = `${__dirname}/../downloads/payssd-woocommerce.zip`;
  res.download(file, 'payssd-woocommerce.zip', (err) => {
    if (err) {
      console.error('❌ Download error:', err.message);
      res.status(500).send('Download failed.');
    }
  });
});

module.exports = router;
