const express = require('express');
const router = express.Router();
const { success } = require('../../utils/response');

router.get('/topics', (req, res) => {
  return success(res, {
    service: 'StaySync Guest Alert Engine',
    status: 'ACTIVE'
  }, 'Notification Service Active');
});

module.exports = router;
