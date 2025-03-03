import express from 'express';

import { isAdmin, requireSignIn } from '../middlewares/authMiddleware.js';
import { createClass, deleteClass, getAllClasses, getClassById, getUpcomingAvailableClasses, updateClass } from '../controllers/classController.js';

const router = express.Router();

// Create a new class (Admin only)
router.post('/', requireSignIn, isAdmin, createClass);

// Get all classes (Authenticated users)
router.get('/', requireSignIn, getAllClasses);

// Get Upcoming Available Classes
router.get("/upcoming", requireSignIn, getUpcomingAvailableClasses);

// Get a specific class by ID (Authenticated users)
router.get('/:id', requireSignIn, getClassById);

// Update a class (Admin only)
router.put('/:id', requireSignIn, isAdmin, updateClass);

// Delete a class (Admin only)
router.delete('/:id', requireSignIn, isAdmin, deleteClass);

export default router;
