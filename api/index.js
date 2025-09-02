// Vercel Serverless Function Entry Point
import '../backend/app/index.js';

export default function handler(req, res) {
  // This file is just for Vercel to detect the project as Node.js
  // The actual server is started in backend/app/index.js
  return res.status(200).json({ message: 'OpenBook Backend is running' });
}
