import express from 'express';
import {
    createRole,
    getAllRoles,
    getRoleById,
    updateRole,
    deleteRole,
} from '../controllers/userRoleController.js';
import { isAdmin, requireSignIn } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Define routes for UserRole
router.post('/', requireSignIn, isAdmin, createRole);           // POST /api/roles
router.get('/', requireSignIn, isAdmin, getAllRoles);           // GET /api/roles
router.get('/:id', requireSignIn, isAdmin, getRoleById);        // GET /api/roles/:id
router.put('/:id', requireSignIn, isAdmin, updateRole);         // PUT /api/roles/:id
router.delete('/:id', requireSignIn, isAdmin, deleteRole);      // DELETE /api/roles/:id

export default router;