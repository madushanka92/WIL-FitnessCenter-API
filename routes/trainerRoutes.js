import express from 'express';
import {
    createTrainer,
    getAllTrainers,
    getTrainerById,
    updateTrainer,
    deleteTrainer,
} from '../controllers/trainerController.js';

const router = express.Router();

// Define routes for Trainer
router.post('/', createTrainer);           // POST /api/trainers
router.get('/', getAllTrainers);           // GET /api/trainers
router.get('/:id', getTrainerById);        // GET /api/trainers/:id
router.put('/:id', updateTrainer);         // PUT /api/trainers/:id
router.delete('/:id', deleteTrainer);      // DELETE /api/trainers/:id

export default router;
