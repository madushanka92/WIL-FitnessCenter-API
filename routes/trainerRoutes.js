import express from 'express';
import {
    createTrainer,
    getAllTrainers,
    getTrainerById,
    updateTrainer,
    deleteTrainer,
} from '../controllers/trainerController.js';
import { isAdmin, requireSignIn } from '../middlewares/authMiddleware.js';
import upload from '../middlewares/multerConfig.js';

const router = express.Router();

// Define routes for Trainer
router.post('/', requireSignIn, isAdmin, upload.single("profile_image"), createTrainer);           // POST /api/trainers
router.get('/', getAllTrainers);           // GET /api/trainers
router.get('/:id', getTrainerById);        // GET /api/trainers/:id
router.put('/:id', requireSignIn, isAdmin, upload.single("profile_image"), updateTrainer);         // PUT /api/trainers/:id
router.delete('/:id', requireSignIn, isAdmin, deleteTrainer);      // DELETE /api/trainers/:id


export default router;
