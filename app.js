const express = require('express');
const fs = require('fs');
const path = require('path');

// Initialize express app
const app = express();
const port = 3000;

// Middleware to parse JSON
app.use(express.json());

// Route to serve the HTML form
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Save User Input as JSON</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    margin: 20px;
                }
                input, button {
                    margin: 10px 0;
                    padding: 10px;
                    font-size: 16px;
                }
                button {
                    cursor: pointer;
                }
            </style>
        </head>
        <body>
            <h1>User Input Form</h1>
            <form id="userForm">
                <label for="name">Name:</label>
                <input type="text" id="name" name="name" required><br>
                <label for="email">Email:</label>
                <input type="email" id="email" name="email" required><br>
                <button type="submit">Submit</button>
            </form>
            <script>
                document.getElementById('userForm').addEventListener('submit', function(event) {
                    event.preventDefault();
                    const name = document.getElementById('name').value;
                    const email = document.getElementById('email').value;
                    const data = { name, email };
                    fetch('/save', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(data)
                    })
                    .then(response => response.json())
                    .then(data => {
                        console.log('Success:', data);
                    })
                    .catch((error) => {
                        console.error('Error:', error);
                    });
                });
            </script>
        </body>
        </html>
    `);
});

// Route to handle saving the user data
app.post('/save', (req, res) => {
    const userData = req.body;
    const filePath = path.join(__dirname, 'data.json');

    fs.readFile(filePath, (err, data) => {
        if (err && err.code === 'ENOENT') {
            // File does not exist, create new file
            return fs.writeFile(filePath, JSON.stringify([userData], null, 2), err => {
                if (err) {
                    return res.status(500).json({ error: 'Failed to save data' });
                }
                res.json({ message: 'Data saved successfully' });
            });
        } else if (err) {
            return res.status(500).json({ error: 'Failed to read data' });
        }

        // File exists, append new data
        const existingData = JSON.parse(data);
        existingData.push(userData);

        fs.writeFile(filePath, JSON.stringify(existingData, null, 2), err => {
            if (err) {
                return res.status(500).json({ error: 'Failed to save data' });
            }
            res.json({ message: 'Data saved successfully' });
        });
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
