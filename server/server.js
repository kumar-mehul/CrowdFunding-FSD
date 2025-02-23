const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const app = express();
const PORT = 3000;

// Sample project data
const projects = [
  {
    id: 1,
    title: 'Project A',
    description: 'This is a sample project description.',
    goalAmount: 5000,
    raisedAmount: 2000,
    endDate: '2024-12-31',
    status: 'Active',
  },
  {
    id: 2,
    title: 'Project B',
    description: 'Another project with a different goal.',
    goalAmount: 10000,
    raisedAmount: 8000,
    endDate: '2024-11-15',
    status: 'Active',
  },
];

// Middleware
app.use(cors());
app.use(express.json()); 

// API route to fetch all projects
app.get('/api/projects', (req, res) => {
  db.query('SELECT * FROM projects', (error, results) => {
    if (error) throw error;
    res.json(results);
  });
});

// MySQL database connection
const db = mysql.createConnection({
  host: 'localhost',      
  user: 'root',   
  password: '0000', 
  database: 'crowdfunding_db' 
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to MySQL database successfully!');
});

// API route to insert project data
app.post('/create-project', (req, res) => {
  const { title, description, goal_amount, end_date } = req.body;

  const insertQuery = `INSERT INTO projects (title, description, goal_amount, end_date)
                       VALUES (?, ?, ?, ?)`;

  db.query(insertQuery, [title, description, goal_amount, end_date], (err, result) => {
    if (err) {
      console.error('Error inserting project data:', err);
      res.status(500).send('Failed to insert project data');
    } else {
      res.send('Project data inserted successfully!');
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
