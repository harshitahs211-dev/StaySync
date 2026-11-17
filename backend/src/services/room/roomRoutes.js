const express = require('express');
const router = express.Router();
const roomController = require('./roomController');

router.get('/hotels', roomController.getHotels);
router.get('/types', roomController.getRoomTypes);
router.get('/amenities', roomController.getAmenities);
router.get('/available', roomController.getAvailableRooms);
router.get('/:id', roomController.getRoomById);
router.get('/', roomController.getAllRooms);

module.exports = router;
