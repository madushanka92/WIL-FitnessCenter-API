import express from 'express';
import {
    createRole,
    getAllRoles,
    getRoleById,
    updateRole,
    deleteRole,
} from '../controllers/userRoleController.js';

const router = express.Router();

// Define routes for UserRole
router.post('/', createRole);           // POST /api/roles
router.get('/', getAllRoles);           // GET /api/roles
router.get('/:id', getRoleById);        // GET /api/roles/:id
router.put('/:id', updateRole);         // PUT /api/roles/:id
router.delete('/:id', deleteRole);      // DELETE /api/roles/:id

export default router;