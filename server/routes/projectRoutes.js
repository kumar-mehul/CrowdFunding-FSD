const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const mysql = require('mysql');

// Create a MySQL connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '0000',
  database: 'crowdfunding_db',
});

// GET all projects
router.get('/projects', (req, res) => {
  const query = 'SELECT * FROM projects';
  db.query(query, (error, results) => {
    if (error) {
      return res.status(500).send(error);
    }
    res.json(results);
  });
});

// Get a single project by id
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM projects WHERE id = ?', [req.params.id]);
    if (rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.status(404).json({ message: 'Project not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error fetching project', error: error.message });
  }
});

// Update a project
router.put('/:id', async (req, res) => {
  const { title, description, goalAmount, endDate } = req.body;
  try {
    await pool.query(
      'UPDATE projects SET title = ?, description = ?, goal_amount = ?, end_date = ? WHERE id = ?',
      [title, description, goalAmount, endDate, req.params.id]
    );
    res.json({ message: 'Project updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating project', error: error.message });
  }
});

// Delete a project
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM projects WHERE id = ?', [req.params.id]);
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting project', error: error.message });
  }
});

router.get('/dashboard', async (req, res) => {
  try {
    const [totalProjects] = await pool.query('SELECT COUNT(*) as count FROM projects');
    const [fundedProjects] = await pool.query('SELECT COUNT(*) as count FROM projects WHERE current_amount >= goal_amount');
    const [totalFundsRaised] = await pool.query('SELECT SUM(current_amount) as total FROM projects');
    const [avgFundingPercentage] = await pool.query('SELECT AVG(current_amount / goal_amount * 100) as avg_percentage FROM projects');
    const [fundsByCategory] = await pool.query('SELECT category, SUM(current_amount) as amount FROM projects GROUP BY category');
    const [recentProjects] = await pool.query('SELECT * FROM projects ORDER BY created_at DESC LIMIT 5');

    res.json({
      totalProjects: totalProjects[0].count,
      fundedProjects: fundedProjects[0].count,
      totalFundsRaised: totalFundsRaised[0].total || 0,
      avgFundingPercentage: Math.round(avgFundingPercentage[0].avg_percentage || 0),
      fundsByCategory,
      recentProjects
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching dashboard data', error: error.message });
  }
});

// Get total number of funded projects
router.get('/funded', async (req, res) => {
  try {
    const [result] = await pool.query('SELECT COUNT(*) as count FROM projects WHERE current_amount >= goal_amount');
    res.json({ count: result[0].count });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching funded projects count', error: error.message });
  }
});

//Create a new project  
router.post('/', async (req, res) => {
  const { userId, title, description, goalAmount, startDate, endDate } = req.body;
  const StartDate = new Date();

  try {
    const [result] = await pool.query(
      'INSERT INTO projects (user_id, title, description, goal_amount, current_amount, start_date, end_date) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [378, title, description, goalAmount, 0, startDate, endDate]
    );
    res.status(201).json({ id: result.insertId, message: 'Project created successfully' });
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ message: 'Error creating project', error: error.message });
  }
});
module.exports = router;