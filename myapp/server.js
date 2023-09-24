#!/usr/bin/env node
const express = require('express');
const { Pool } = require('pg');

const app = express();
const port = 3000;

const pool = new Pool({
    user: 'azureuser',
    host: 'localhost',
    database: 'shawnzhome',
    password: 'hoosiers57!',
    port: 5432,
});

app.use(express.json());  // Middleware to parse JSON requests

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
    const queryText = 'SELECT * FROM webdav_files WHERE file_name ILIKE $1';
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
