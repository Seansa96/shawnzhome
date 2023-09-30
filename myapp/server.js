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


app.post('/api/status', (req, res) => {
    const status = req.body.status;
    if (!status) {
        res.status(400).json({ error: 'Missing required parameter: status' });
        return;
    }
    pool.query('INSERT INTO statusupdates (status) VALUES ($1)', [status], (error, results) => {
        if (error) {
            console.error('Error executing query', error.stack);
            res.status(500).json({ error: 'Database error' });
        } else {
            res.status(201).json({ status: 'Success' });
        }
    });
});


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

app.get('/api/update', (req, res) => {
        //console.log("We made it!");
        pool.query('SELECT status FROM statusupdates ORDER BY created_at DESC LIMIT 1', (error, results) =>{
        const latestStatus = results.rows[0]&& results.rows[0].status ? results.rows[0].status: "No Status available";
        const styledResponse =`
                        <html>
                                <head>
                                        <style>
                        body {font-family: Arial, Helvetica, sans-serif;
                                color: white;
                                background-color: black;
                                font-size: 24px;
                                text-align: center;
                                font-weight: bold;
                                border: 5px solid white;
                        }
        }
                </style>
                </head>
                <body>
                        Working on ${latestStatus}
                </body>
                </html>
                `;
        res.send(styledResponse);
        });
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});