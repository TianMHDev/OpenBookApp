// teacherRoutes.js
import express from 'express';
import { verificarToken } from '../app/index.js'; // ajusta la ruta si tu middleware está en otro lugar
import {
  getTeacherDashboard,
  assignBookToStudent,
  getTeacherAssignments
} from '../services/teacher.js';

const router = express.Router();

// todas las rutas requieren token (profesor)
router.get('/dashboard', verificarToken, getTeacherDashboard);
router.post('/assign', verificarToken, assignBookToStudent);
router.get('/assignments', verificarToken, getTeacherAssignments);

export default router;
