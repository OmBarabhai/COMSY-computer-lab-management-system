import mongoose from 'mongoose';
import express from 'express';
import Booking from '../models/Booking.js';
import Computer from '../models/Computer.js';
import { authenticate } from '../middleware/authMiddleware.js';
// Remove import for generateExcel/generatePDF unless implemented

const router = express.Router();

// CREATE booking
router.post('/', authenticate, async (req, res) => {
  try {
    const { computer, startTime, endTime, purpose } = req.body;

    // Validate required fields
    if (!computer || !startTime || !endTime || !purpose) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Validate computerId
    if (!mongoose.Types.ObjectId.isValid(computer)) {
      return res.status(400).json({ message: 'Invalid computer ID' });
    }

    // Check computer availability
    const computerDetails = await Computer.findById(computer);
    if (!computerDetails || computerDetails.status !== 'approved') {
      return res.status(400).json({ message: 'Computer not available for booking' });
    }

    // Convert to Date objects
    const start = new Date(startTime);
    const end = new Date(endTime);

    // Check for overlapping bookings
    const overlappingBooking = await Booking.findOne({
      computer,
      status: { $in: ['upcoming', 'ongoing'] },
      $or: [
        { startTime: { $lt: end }, endTime: { $gt: start } },
        { startTime: { $gte: start, $lte: end } },
        { endTime: { $gte: start, $lte: end } }
      ]
    });

    if (overlappingBooking) {
      return res.status(400).json({ message: 'Computer already booked for this time' });
    }

    // Create booking
    const booking = new Booking({
      user: req.user.userId,
      computer,
      startTime: start,
      endTime: end,
      purpose,
      status: 'upcoming'
    });

    await booking.save();
    res.status(201).json(booking);
    
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ message: error.message });
  }
});

// Middleware to update booking statuses
router.use(async (req, res, next) => {
  try {
    const now = new Date();
    
    // Update ongoing bookings
    await Booking.updateMany(
      {
        startTime: { $lte: now },
        endTime: { $gte: now },
        status: 'upcoming'
      },
      { status: 'ongoing' }
    );

    // Update completed bookings
    await Booking.updateMany(
      {
        endTime: { $lt: now },
        status: { $in: ['upcoming', 'ongoing'] }
      },
      { status: 'completed' }
    );

    // Update computer statuses
    const ongoingBookings = await Booking.find({ status: 'ongoing' });
    const computerIds = ongoingBookings.map(b => b.computer);
    
    await Computer.updateMany(
      { _id: { $in: computerIds } },
      { operationalStatus: 'in-use' }
    );
    
    await Computer.updateMany(
      { _id: { $nin: computerIds } },
      { operationalStatus: 'available' }
    );

    next();
  } catch (error) {
    console.error('Error updating statuses:', error);
    next(error);
  }
});

// CANCEL booking
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    if (booking.status !== 'upcoming') {
      return res.status(400).json({ message: 'Only upcoming bookings can be cancelled' });
    }

    await Booking.findByIdAndDelete(req.params.id);
    res.json({ message: 'Booking cancelled successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET all bookings
router.get('/', authenticate, async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('user', 'username')
      .populate('computer', 'name specs');
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET attendance data
router.get('/attendance', authenticate, async (req, res) => {
  try {
    const { from, to } = req.query;
    if (!from || !to) {
      return res.status(400).json({ message: 'Please provide date range' });
    }

    const bookings = await Booking.find({
      startTime: { $gte: new Date(from) },
      endTime: { $lte: new Date(to) }
    })
    .populate('user', 'username')
    .populate('computer', 'name');

    res.json(bookings);
  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({ message: error.message });
  }
});

// Comment out export routes until implemented
/*
router.get('/attendance/excel', authenticate, async (req, res) => {
  // Implement later
});

router.get('/attendance/pdf', authenticate, async (req, res) => {
  // Implement later
});
*/

export default router;