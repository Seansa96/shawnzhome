#!/usr/bin/env node
const express = require('express');
const { Pool } = require('pg');
const fs = require('fs');
const recursiveReaddir = require('recursive-readdir');

const app = express();
const port = 3030;

const pool = new Pool({
    user: 'azureuser',
    host: 'localhost',
    database: 'shawnzhome',
    password: 'hoosiers57!',
    port: 5432,
});

app.use(express.json());  // Middleware to parse JSON requests


recursiveReaddir('../webdav', (err, files) => {
    if (err) {
      console.error("Failed to read directory:", err);
      return;
    }
  
    files.forEach(file => {
      pool.query('INSERT INTO webdav_files (filename) VALUES ($1)', [file], (error, results) => {
        if (error) {
          console.error("Failed to insert file into database:", error);
        }
      });
    });
  });

app.get('/', (req, res) => {
    pool.query('SELECT NOW()', (err, dbRes) => {
        if (err) {
            res.send('Error querying the database.');
        } else {
            res.send('Current time from PostgreSQL: ' + dbRes.rows[0].now);
        }
    });
});

// Add the /api/search route here
app.get('/api/search', (req, res) => {
    const searchTerm = req.query.q;
    const queryText = 'SELECT * FROM webdav_files WHERE filename ILIKE $1';
    pool.query(queryText, [`%${searchTerm}%`], (err, dbRes) => {
        if (err) {
            console.error('Error executing query', err.stack);
            res.status(500).json({ error: 'Database error' });
        } else {
            res.json(dbRes.rows);
        }
    });
});


app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
