#!/usr/bin/env node
require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const fs = require('fs');
const recursive = require('recursive-readdir');
const path = require('path');


const baseURL = process.env.WEBDAV_BASE_URL;
const pword = process.env.password;
const app = express();
const port = 3030;

const pool = new Pool({
    user: 'azureuser',
    host: 'localhost',
    database: 'shawnzhome',
    password: `${pword}`,
    port: 5432,
});

app.use(express.json());  // Middleware to parse JSON requests
app.use('/static', express.static('/var/www/html'));  // Static files

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


recursive('../webdav', (err, files) => {
    if (err) {
      console.error("Failed to read directory:", err);
      return;
    }

    files.forEach(file => {
      const fullURL = baseURL + file;
      pool.query('INSERT INTO webdav_files (filename) VALUES ($1) ON CONFLICT (filename) DO NOTHING', [fullURL], (error, results) => {
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

app.get('/get-env', (req, res) => {
    let myEnvVar = baseURL;
    res.json({value: myEnvVar});
	console.log("Success");
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

app.get('/api/submitupdate', (req, res) => {
    const styledResponse = `

    <html>
    <head>
        <!-- Adding Bootstrap CSS -->
        <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css">
        <script>
            function sendStatus() {
                var xhr = new XMLHttpRequest();
                xhr.open("POST", "/api/status", true);
                xhr.setRequestHeader('Content-Type', 'application/json');
                var sqlValue = document.getElementById("sqlQuery").value;
    
                var json = JSON.stringify({status: sqlValue});
    
                xhr.send(json);
    
                xhr.onload = function() {
                    if (xhr.status >= 202) {
                        // Display Bootstrap modal for error
                        document.getElementById("modal-title").textContent = "Error";
                        document.getElementById("modal-body").textContent = "Error " + xhr.status + ": " + xhr.statusText;
                    } else {
                        // Display Bootstrap modal for success
                        document.getElementById("modal-title").textContent = "Success";
                        document.getElementById("modal-body").textContent = "Status updated!";
                    }
                    $('#messageModal').modal('show'); // Using jQuery to show the modal
                }
            };
        </script>
    </head>
    <body style="background-color: burlywood; align-items: center; justify-content:center;">
        <div class="container">
            <form onsubmit="event.preventDefault(); sendStatus();">
                <!-- Bootstrap input field -->
                <div class="form-group">
                    <input type="text" class="form-control" id="sqlQuery" name="status" placeholder="Enter Status Here">
                </div>
                <!-- Bootstrap button -->
                <button class="btn btn-primary" onclick="sendStatus()" style="background-color: black;">Submit</button>
            </form>
        </div>
    
        <!-- Bootstrap modal for messages -->
        <div class="modal fade" id="messageModal" tabindex="-1" role="dialog">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="modal-title"></h5>
                        <button type="button" class="close" data-dismiss="modal">&times;</button>
                    </div>
                    <div class="modal-body" id="modal-body">
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                    </div>
                </div>
            </div>
        </div>
        <div style="right: 50px; border: 10px; border-color: black; text-decoration: none;font-size: 24px; position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%); font-family: Arial, Helvetica, Sans Serif;"> <a href="${baseURL}">Home</a> </div>
        
        <!-- Including jQuery and Bootstrap's JS library -->
        <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
        <script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js"></script>
    </body>
    </html>
    `;    
    res.send(styledResponse);
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
             <img src="/static/primetech.png" style='position: absolute; left: 50px; right: 20px; margin-top:100px;'">
                </html>
                `;
        res.send(styledResponse);
        });
});


app.get('/dashboard', (req, res) => {
    res.type(`html`);
    res.sendFile(path.join(`/var/www/html`, `/dashboard.html`));
	console.log("Success");
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
