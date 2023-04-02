// routes/publicData.js
const express = require('express');
const router = express.Router();
const axios = require('axios');

router.get('/random-users', async (req, res) => {
  try {
    const response = await axios.get('https://randomuser.me/api/?results=5');
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching data from the external API.' });
  }
});

module.exports = router;

