
const { parse } = require('json2csv');
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const csv = require('fast-csv');
const fs = require('node:fs');
const path = require('node:path');

const app = express();
const port = 5000;

app.use(express.json());
app.use(cors());


const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "artist_system"
});

// Set up MySQL connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "artist_system",
});

db.connect((err) => {
  if (err) throw err;
  console.log("Connected to MySQL");
});

// API route to get an artist by ID
app.get("/artists/:artistId", (req, res) => {
  const artistId = parseInt(req.params.artistId, 10); // Get artistId from URL
  const query = "SELECT * FROM artists WHERE id = ?";
  
  db.query(query, [artistId], (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Error fetching artist data", error: err });
    }

    if (results.length > 0) {
      res.json(results[0]); 
    } else {
      res.status(404).json({ error: "Artist not found" });
    }
  });
});

const queryDatabase = async (query, params) => {
  return new Promise((resolve, reject) => {
    pool.execute(query, params, (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
};


// API route to get all artists
app.get("/artists", (req, res) => {
  db.query("SELECT * FROM artists", (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Error fetching artists", error: err });
    }
    res.json(results);
  });
});

// API route to add an artist
app.post("/artists", (req, res) => {
  const { name, email, insurance_balance, startdate, enddate } = req.body;
  const query = "INSERT INTO artists (name, email, insurance_balance, startdate, enddate) VALUES (?, ?, ?, ?, ?)";
  
  db.query(query, [name, email, insurance_balance, startdate, enddate], (err, result) => {
    if (err) {
      console.error("Error adding artist:", err);
      return res.status(500).json({ message: "Error adding artist", error: err });
    }
    res.json({ message: "Artist added successfully", artistId: result.insertId });
  });
});

// API route to update an artist
app.put("/artists/:id", (req, res) => {
  const { name, email, insurance_balance, startdate, enddate } = req.body;
  const query = "UPDATE artists SET name = ?, email = ?, insurance_balance = ?, startdate = ?, enddate = ? WHERE id = ?";
  
  db.query(query, [name, email, insurance_balance, startdate, enddate, req.params.id], (err, result) => {
    if (err) {
      return res.status(500).json({ message: "Error updating artist", error: err });
    }
    res.json({ message: "Artist updated successfully" });
  });
});

// API route to delete an artist
app.delete("/artists/:id", (req, res) => {
  const query = "DELETE FROM artists WHERE id = ?";
  db.query(query, [req.params.id], (err, result) => {
    if (err) {
      return res.status(500).json({ message: "Error deleting artist", error: err });
    }
    res.json({ message: "Artist deleted successfully" });
  });
});

// Add Tours
app.get('/tours/:artistId', (req, res) => {
  const artistId = parseInt(req.params.artistId, 10); // Ensure artistId is a number
  const query = "SELECT * FROM tours WHERE art_id = ?"; // Adjust 'art_id' as per your database schema

  db.query(query, [artistId], (err, results) => {
    if (err) {
      console.error("Error fetching tours:", err);
      return res.status(500).json({ message: "Error fetching tours", error: err });
    }
    if (results.length > 0) {
      res.json(results); // Send tour data
    } else {
      res.status(404).json({ message: "No tours found for this artist" });
    }
  });
});


// API route to get all Tours
app.get("/tours", (req, res) => {
  db.query("SELECT * FROM tours", (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Error fetching tours", error: err });
    }
    res.json(results);
    console.log(results);
  });
});

// Add this new route to delete all artists
app.delete("/artists", (req, res) => {
  console.log(`Received a DELETE request at /artists`);
  const query = "DELETE FROM artists";
  db.query(query, (err, result) => {
    if (err) {
      console.error("Error deleting all artists:", err);
      res.status(500).json({ error: "Error deleting all artists" });
    } else {
      res.status(200).json({ message: "All artists deleted successfully" });
    }
  });
});


//Add Tours
app.post("/tours", (req, res) => {
  const { art_id, name, place, income, date } = req.body;
  const query = "INSERT INTO tours (art_id, name, place, income, date) VALUES (?, ?, ?, ?, ?)";
  
  db.query(query, [art_id, name, place, income, date], (err, result) => {
    if (err) {
      console.error("Error adding tour:", err);
      return res.status(500).json({ message: "Error adding tour", error: err });
    }
    res.json({ message: "Tour added successfully", tourId: result.insertId });
  });
});

// Get Tours
app.get('/tours', async (req, res) => {
  const { artistId } = req.query;
  try {
    const tours = await Tour.find({ artistId }); // Fetch tours from the database based on artistId
    res.json(tours); // Send the tours as a response
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tours' });
  }
});

// Update Tours
app.put("/tours/:tourId", (req, res) => {
  console.log("Tour ID received for update:", req.params.id); 
  const { name, place, income, date } = req.body;
  

  console.log("Data to update:", { name, place, income, date });
  

  const query = "UPDATE tours SET name = ?, place = ?, income = ?, date = ? WHERE id = ?";


  db.query(query, [name, place, income, date, req.params.id], (err, result) => {
    if (err) {
      console.error("Error updating tour:", err);
      return res.status(500).json({ message: "Error updating tour", error: err });
    }
    

    console.log("Update result:", result);
    

    if (result.affectedRows > 0) {
      res.json({ message: "Tour updated successfully" });
    } else {
      console.log("No rows affected, tour may not exist or ID mismatch");
      res.status(404).json({ message: "Tour not found" });
    }
  });
});

// API route to get historical tours 
app.get('/tours/history/:artistId', (req, res) => {
  const artistId = parseInt(req.params.artistId, 10); 
  const today = new Date().toISOString().split('T')[0]; 
  const query = "SELECT * FROM tours WHERE art_id = ? AND date < ?"; 

  db.query(query, [artistId, today], (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Error fetching historical tours", error: err });
    }
    res.json(results); 
  });
});

// API route to delete an artist
app.delete("/tours/:id", (req, res) => {
  const query = "DELETE FROM tours WHERE id = ?";
  db.query(query, [req.params.id], (err, result) => {
    if (err) {
      return res.status(500).json({ message: "Error deleting tour", error: err });
    }
    res.json({ message: "tour deleted successfully" });
  });
});


// Get Tours For Slug2
app.get("/tours/:id", (req, res) => {
  const artistId = parseInt(req.params.artistId, 10); 
  db.query(`SELECT * FROM tours WHERE art_id = ${artistId}`, (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Error fetching tours", error: err });
    }
    res.json(results);
    console.log(results);
  });
});
// API route to get all artists
app.get("/artists/:id", (req, res) => {
  db.query("SELECT * FROM artists WHERE art_id = ${artistId}`,", (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Error fetching artists", error: err });
    }
    res.json(results);
  });
});


// Add Pre-Tour
app.post("/pre_tour", (req, res) => {
  const {art_id, tour_id, statements, link, status } = req.body;

  // SQL query to insert a new record into the pre_tour table
  const query = `
    INSERT INTO pre_tour (tour_id, art_id, statements, link, status) 
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(query, [tour_id, art_id, statements, link, status], (err, result) => {
    if (err) {
      console.error("Error adding pre-tour data:", err);
      return res.status(500).json({ message: "Error adding pre-tourt data", error: err });
    }
    res.json({ message: "Pre-tour data added successfully", prePostId: result.insertId });
  });
});

// Get Pre-Tour
app.get("/pre_tour/:artistId/:tourId", (req, res) => {
  const { artistId, tourId } = req.params; // Capture route parameters
  const query = `SELECT * FROM pre_tour WHERE art_id = ? AND tour_id = ?`;

  db.query(query, [artistId, tourId], (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Error fetching pre-tour", error: err });
    }
    res.json(results);
    console.log(results);
  });
});


// UPDATE Pre-Tour Status
app.put("/pre_tour/status/:id", (req, res) => {
  const statementId = req.params.id;  // Get the statement ID from the URL
  const { status } = req.body;        // Get the updated status from the request body

  console.log("Updating statement with ID:", statementId);
  console.log("New status:", status);

  // Assuming you're updating the 'status' column in the 'pre_tour' table
  const query = "UPDATE pre_tour SET status = ? WHERE id = ?";

  // Update query with the correct parameters: status and statementId
  db.query(query, [status, statementId], (err, result) => {
    if (err) {
      console.error("Error updating status:", err);
      return res.status(500).json({ message: "Error updating status", error: err });
    }

    if (result.affectedRows > 0) {
      res.json({ message: "Statement status updated successfully" });
    } else {
      console.log("No rows affected, statement may not exist or ID mismatch");
      res.status(404).json({ message: "Statement not found" });
    }
  });
});



// DELETE Pre-Tour
app.delete("/pre_tour/:id", (req, res) => {
  const query = "DELETE FROM pre_tour WHERE id = ?";
  db.query(query, [req.params.id], (err, result) => {
    if (err) {
      return res.status(500).json({ message: "Error deleting tour", error: err });
    }
    res.json({ message: "tour deleted successfully" });
  });
});

// UPDATE Pre-Tour
app.put("/pre_tour/:id", (req, res) => {
  const { statements, link } = req.body;
  console.log("Received update for:", statements, link, "Tour ID:", req.params.id);

  const query = "UPDATE pre_tour SET statements = ?, link = ? WHERE id = ?";

  db.query(query, [statements, link, req.params.id], (err, result) => {
    if (err) {
      console.error("Error in update:", err);
      return res.status(500).json({ message: "Error updating tour", error: err });
    }
    console.log("Update result:", result);
    res.json({ message: "Tour updated successfully" });
  });
});

// Add Tax Variation
app.post("/tax_variation", (req, res) => {
  const { country, task_name, task_link, date, status, art_id, tour_id } = req.body;

  // Check if the tour_id exists in the pre_tour table
  const checkTourQuery = "SELECT * FROM pre_tour WHERE tour_id = ?";
  
  db.query(checkTourQuery, [tour_id, art_id], (err, result) => {
    if (err) {
      console.error("Error checking pre_tour table:", err);
      return res.status(500).json({ message: "Error checking pre-tour data", error: err });
    }

    if (result.length === 0) {
      return res.status(400).json({ message: "Invalid tour_id, no matching record found in pre_tour" });
    }

    // If the tour_id exists, proceed with inserting into tax_variation
    const query = `
      INSERT INTO tax_variation (tour_id, art_id, country, task_name, task_link, date, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(query, [tour_id, art_id, country, task_name, task_link, date, status], (err, result) => {
      if (err) {
        console.error("Error adding tax variation data:", err);
        return res.status(500).json({ message: "Error adding tax variation data", error: err });
      }
      res.json({ message: "Tax variation data added successfully", taxVariationId: result.insertId });
    });
  });
});

// Get TaxVariation
app.get("/tax_variation/:artistId/:tourId", (req, res) => {
  const { artistId, tourId } = req.params; // Capture route parameters
  const query = `SELECT * FROM tax_variation WHERE art_id = ? AND tour_id = ?`;

  db.query(query, [artistId, tourId], (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Error fetching pre-tour", error: err });
    }
    res.json(results);
    console.log(results);
  });
});

// UPDATE Tax Status
app.put("/tax_variation/status/:id", (req, res) => {
  const statementId = req.params.id;
  const { status } = req.body;

  console.log("Updating statement with ID:", statementId);
  console.log("New status:", status);

  // Assuming you're updating the 'status' column in the 'tax_variation' table
  const query = "UPDATE tax_variation SET status = ? WHERE id = ?";

  db.query(query, [status, statementId], (err, result) => {
    if (err) {
      console.error("Error updating status:", err);
      return res.status(500).json({ message: "Error updating status", error: err });
    }

    if (result.affectedRows > 0) {
      res.json({ message: "Statement status updated successfully" });
    } else {
      console.log("No rows affected, statement may not exist or ID mismatch");
      res.status(404).json({ message: "Statement not found" });
    }
  });
});

// UPDATE Tax Variation
app.put("/tax_variation/:id", (req, res) => {
  const { country, task_name, date, task_link } = req.body;
  console.log("Received update for:", country, task_name, date, task_link, "Tour ID:", req.params.id);

  const query = "UPDATE tax_variation SET country = ?, task_name = ?, date = ?, task_link = ? WHERE id = ?";

  db.query(query, [country, task_name, date, task_link, req.params.id], (err, result) => {
    if (err) {
      console.error("Error in update:", err);
      return res.status(500).json({ message: "Error updating Tax", error: err });
    }
    console.log("Update result:", result);
    res.json({ message: "Tax updated successfully" });
  });
});

// DELETE Tax Variation
app.delete("/tax_variation/:id", (req, res) => {
  const query = "DELETE FROM tax_variation WHERE id = ?";
  db.query(query, [req.params.id], (err, result) => {
    if (err) {
      return res.status(500).json({ message: "Error deleting tour", error: err });
    }
    res.json({ message: "tour deleted successfully" });
  });
});

// Add Contractor
app.post("/contractor", (req, res) => {
  const {art_id, tour_id, payment, people, trip_country, people_oversea, trip_oversea, notes } = req.body;

  // SQL query to insert a new record into the contractor table
  const query = `
    INSERT INTO contractor (art_id, tour_id, payment, people, trip_country, people_oversea, trip_oversea, notes) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(query, [art_id, tour_id, payment, people, trip_country, people_oversea, trip_oversea, notes], (err, result) => {
    if (err) {
      console.error("Error adding contractor data:", err);
      return res.status(500).json({ message: "Error adding contractor data", error: err });
    }
    res.json({ message: "contractor data added successfully", prePostId: result.insertId });
  });
});

// Get Contractors
app.get("/contractor/:artistId/:tourId", (req, res) => {
  const { artistId, tourId } = req.params; // Capture route parameters
  const query = `SELECT * FROM contractor WHERE art_id = ? AND tour_id = ?`;

  db.query(query, [artistId, tourId], (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Error fetching pre-tour", error: err });
    }
    res.json(results);
    console.log(results);
  });
});

// UPDATE Contractors
app.put("/contractor/:id", (req, res) => {
  const { payment, people, trip_country, people_oversea, trip_oversea, notes } = req.body;
  console.log("Received update for:", payment, people, trip_country, people_oversea, trip_oversea, notes, "Tour ID:", req.params.id);

  const query = "UPDATE contractor SET payment = ?, people = ?, trip_country = ?, people_oversea = ?, trip_oversea = ?, notes = ? WHERE id = ?";

  db.query(query, [payment, people, trip_country, people_oversea, trip_oversea, notes, req.params.id], (err, result) => {
    if (err) {
      console.error("Error in update:", err);
      return res.status(500).json({ message: "Error updating Tax", error: err });
    }
    console.log("Update result:", result);
    res.json({ message: "Tax updated successfully" });
  });
});

// DELETE Contractors
app.delete("/contractor/:id", (req, res) => {
  const query = "DELETE FROM contractor WHERE id = ?";
  db.query(query, [req.params.id], (err, result) => {
    if (err) {
      return res.status(500).json({ message: "Error deleting contractor", error: err });
    }
    res.json({ message: "contractor deleted successfully" });
  });
});

//FLUSH ADD DATA
app.delete('/flush-all-data', async (req, res) => {
  try {
    const tables = [
      'artists', 'tours', 'pre_tour', 'tax_variation', 'contractor', 'insurance', 'post_tour'
    ];

    for (const table of tables) {
      await queryDatabase(`DELETE FROM ${table}`);
      console.log(`Data flushed from ${table}`);
    }

    res.status(200).send("All data has been flushed successfully.");
  } catch (error) {
    console.error("Error flushing data:", error);
    res.status(500).send("An error occurred while flushing data.");
  }
});

// Add Contractor
app.post("/contractor", (req, res) => {
  const {art_id, tour_id, payment, people, trip_country, people_oversea, trip_oversea, notes } = req.body;

  // SQL query to insert a new record into the contractor table
  const query = `
    INSERT INTO contractor (art_id, tour_id, payment, people, trip_country, people_oversea, trip_oversea, notes) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(query, [art_id, tour_id, payment, people, trip_country, people_oversea, trip_oversea, notes], (err, result) => {
    if (err) {
      console.error("Error adding contractor data:", err);
      return res.status(500).json({ message: "Error adding contractor data", error: err });
    }
    res.json({ message: "contractor data added successfully", prePostId: result.insertId });
  });
});

// ADD INSURANCE
app.post('/insurance', async (req, res) => {
  const { art_id, tour_id, liability_notes, insurance_notes, equipment_notes, workcover_notes, required_balance } = req.body;

  // Ensure requiredbalance is set to a default value if it's empty or undefined
  const balance = required_balance || 0;

  try {
    const query = `
      INSERT INTO insurance 
      (art_id, tour_id, required_balance, liability_notes, insurance_notes, equipment_notes, workcover_notes, created_at, updated_at) 
      VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;

    db.query(query, [art_id, tour_id, balance, liability_notes, insurance_notes, equipment_notes, workcover_notes, required_balance], (err, result) => {
      if (err) {
        console.error("Error adding insurance data:", err);
        return res.status(500).json({ message: "Error adding insurance data", error: err });
      }
      res.json({ message: "Insurance data added successfully", prePostId: result.insertId });
    });
  } catch (error) {
    console.error("Error processing request:", error);
    res.status(500).json({ message: "Server error", error });
  }
});


// Get Insurance Notes
app.get("/insurance/:artistId/:tourId", (req, res) => {
  const { artistId, tourId } = req.params; 
  const query = `SELECT * FROM insurance WHERE art_id = ? AND tour_id = ?`;

  db.query(query, [artistId, tourId], (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Error fetching insurance", error: err });
    }
    res.json(results);
    console.log(results);
  });
});

// UPDATE Insurance
app.put("/insurance/:id", (req, res) => {
  const {id, required_balance, liability_notes, insurance_notes, equipment_notes, workcover_notes } = req.body;
  console.log("Received update for:", id, required_balance, liability_notes, insurance_notes, equipment_notes, workcover_notes, "Tour ID:", req.params.id);

  const query = `
    UPDATE insurance 
    SET 
      id = ?,
      required_balance = ?,
      liability_notes = ?, 
      insurance_notes = ?, 
      equipment_notes = ?, 
      workcover_notes = ?, 
      updated_at = NOW() 
  `;

  db.query(
    query, 
    [id,  required_balance, liability_notes, insurance_notes, equipment_notes, workcover_notes, ], 
    (err, result) => {
      if (err) {
        console.error("Error in update:", err);
        return res.status(500).json({ message: "Error updating insurance", error: err });
      }
      console.log("Update result:", result);
      res.json({ message: "Insurance updated successfully" });
    }
  );
});


// Add Post-Tour
app.post("/post_tour", (req, res) => {
  const {art_id, tour_id, name, link, status } = req.body;

  // SQL query to insert a new record into the post_tour table
  const query = `
    INSERT INTO post_tour (tour_id, art_id, name, link, status) 
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(query, [tour_id, art_id, name, link, status], (err, result) => {
    if (err) {
      console.error("Error adding Post-Tour data:", err);
      return res.status(500).json({ message: "Error adding Post-Tour data", error: err });
    }
    res.json({ message: "Post-Tour data added successfully", prePostId: result.insertId });
  });
});

// Get Post-Tour
app.get("/post_tour/:artistId/:tourId", (req, res) => {
  const { artistId, tourId } = req.params; // Capture route parameters
  const query = `SELECT * FROM post_tour WHERE art_id = ? AND tour_id = ?`;

  db.query(query, [artistId, tourId], (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Error fetching Post-Tour", error: err });
    }
    res.json(results);
    console.log(results);
  });
});


// UPDATE Post-Tour Status
app.put("/post_tour/status/:id", (req, res) => {
  const statementId = req.params.id;  // Get the statement ID from the URL
  const { status } = req.body;  // Get the updated status from the request body

  console.log("Updating statement with ID:", statementId);
  console.log("New status:", status);

  // Assuming you're updating the 'status' column in the 'Post-Tour' table
  const query = "UPDATE post_tour SET status = ? WHERE id = ?";

  db.query(query, [status, statementId], (err, result) => {
    if (err) {
      console.error("Error updating status:", err);
      return res.status(500).json({ message: "Error updating status", error: err });
    }

    if (result.affectedRows > 0) {
      res.json({ message: "Statement status updated successfully" });
    } else {
      console.log("No rows affected, statement may not exist or ID mismatch");
      res.status(404).json({ message: "Statement not found" });
    }
  });
});


// DELETE Post-Tour
app.delete("/post_tour/:id", (req, res) => {
  const query = "DELETE FROM post_tour WHERE id = ?";
  db.query(query, [req.params.id], (err, result) => {
    if (err) {
      return res.status(500).json({ message: "Error deleting Post-Tour", error: err });
    }
    res.json({ message: "Post-Tour deleted successfully" });
  });
});

// UPDATE Post-Tour
app.put("/post_tour/:id", (req, res) => {
  const { name, link } = req.body;
  console.log("Received update for:", name, link, "Tour ID:", req.params.id);

  const query = "UPDATE post_tour SET name = ?, link = ? WHERE id = ?";

  db.query(query, [name, link, req.params.id], (err, result) => {
    if (err) {
      console.error("Error in update:", err);
      return res.status(500).json({ message: "Error updating Post-Tour", error: err });
    }
    console.log("Update result:", result);
    res.json({ message: "Post-Tour updated successfully" });
  });
});


app.get('/download/:artistId', async (req, res) => {
  let artistId; 
  try {
    artistId = Number.parseInt(req.params.artistId, 10);
    console.log('Artist ID:', artistId);

    // Fetch data from all relevant tables
    const tables = {
      artist: 'SELECT * FROM artists where id = ?',
      tours: 'SELECT * FROM tours WHERE art_id = ?',
      preTour: 'SELECT * FROM pre_tour WHERE art_id = ?',
      taxVariation: 'SELECT * FROM tax_variation WHERE art_id = ?',
      contractors: 'SELECT * FROM contractor WHERE art_id = ?',
      insurance: 'SELECT * FROM insurance WHERE art_id = ?',
      postTour: 'SELECT * FROM post_tour WHERE art_id = ?',
    };

    const data = {};
    for (const [key, query] of Object.entries(tables)) {
      const rows = await queryDatabase(query, [artistId]);
      console.log(`${key} data:`, rows); // Log the data for debugging
      data[key] = rows;
    }

    // Check if data is valid
    if (Object.values(data).every((rows) => rows.length === 0)) {
      throw new Error('No data found for this artistId');
    }

    // Create CSV content using json2csv
    let csvContent = '';
    for (const [section, rows] of Object.entries(data)) {
      if (rows.length > 0) {
        csvContent += `#${section}\n`;
        csvContent += parse(rows); // Use json2csv parse function to generate CSV content
        csvContent += '\n\n';
      }
    }

    // Temporary file storage
    const fileName = `artist_${artistId}_data.csv`;
    const downloadFolderPath = path.join(__dirname, 'downloads');
    if (!fs.existsSync(downloadFolderPath)) {
      fs.mkdirSync(downloadFolderPath); // Create folder if it doesn't exist
    }

    const filePath = path.join(downloadFolderPath, fileName);
    console.log('Saving CSV to:', filePath); // Log the file path for debugging

    // Save and serve the CSV file
    fs.writeFileSync(filePath, csvContent);

    res.download(filePath, fileName, (err) => {
      if (err) {
        console.error('Error sending file:', err);
        return res.status(500).send('Error generating CSV');
      }
      // Delete file after sending
      fs.unlink(filePath, (unlinkErr) => {
        if (unlinkErr) console.error('Error deleting file:', unlinkErr);
      });
    });
  } catch (error) {
    console.error('Error generating CSV:', error);
    console.log("Requesting CSV for artistId:", artistId);
    res.status(500).json({ error: error.message || 'Failed to generate CSV' });
  }
});



// Helper function to parse CSV data
const parseCSV = (filePath, artistId) => {
  console.log('Parsing CSV file:', filePath, 'for artistId:', artistId);

  return new Promise((resolve, reject) => {
    const results = {
      tours: [],
      preTour: [],
      taxVariation: [],
      contractors: [],
      insurance: [],
      postTour: [],
    };

    let currentSection = '';

    fs.createReadStream(filePath)
      .pipe(csv.parse({ delimiter: ',' }))
      .on('data', (data) => {
        const row = data.map(item => item.trim());

        console.log('Row:', row);

        // Skip empty rows
        if (row.length === 0) return;

        // check if every column is empty
        if (row.every(item => item === '')) return;

        // Check for section headers
        if (row[0].startsWith('#')) {
          currentSection = row[0].toLowerCase().replace('#', '').trim();
          return;
        }

        // Process data based on current section
        switch (currentSection) {
          case 'tours':
            if (row[0] !== 'tour_name') { // Skip header row
              results.tours.push({
                name: row[0],
                place: row[1],
                income: Number.parseFloat(row[2]),
                date: row[3],
                art_id: artistId 
              });
            }
            break;
          case 'pre tour':
            if (row[0] !== 'tour_id') {
              results.preTour.push({
                statements: row[1],
                link: row[2],
                status: row[3]
              });
            }
            break;
          case 'tax variation':
            if (row[0] !== 'tour_id') {
              results.taxVariation.push({
                country: row[1],
                task: row[2],
                due_date: row[3],
                link: row[4],
                status: row[5]
              });
            }
            break;
          case 'contractors':
            if (row[0] !== 'tour_id') {
              results.contractors.push({
                payment: row[1],
                domestic_people: row[2],
                domestic_trips: row[3],
                overseas_people: row[4],
                overseas_trips: row[5],
                notes: row[6]
              });
            }
            break;
          case 'insurance':
            if (row[0] !== 'tour_id') {
              results.insurance.push({
                liability_notes: row[2],
                insurance_notes: row[4],
                equipment_notes: row[6],
                workcover_notes: row[8]
              });
            }
            break;
            case 'post tour':
              if (row[0] !== 'tour_id') {
                results.postTour.push({
                  statements: row[1],
                  link: row[2],
                  status: row[3]
                });
              }
              break;
        }
      })
      .on('end', () => resolve(results))
      .on('error', reject);
  });
};

// Route to handle CSV upload
app.post('/upload/:artistId', upload.single('file'), async (req, res) => {
  try {
    const artistId = Number.parseInt(req.params.artistId, 10); 
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const results = await parseCSV(req.file.path, artistId); 

    console.log('Parsed data:', results);

    // Process the parsed data
    await processUploadedData(results, artistId);

    // Clean up the uploaded file
    fs.unlinkSync(req.file.path);

    res.json({ message: 'Upload successful', results });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Error processing upload' });
  }
});

// Helper function to process the uploaded data
async function processUploadedData(data, artistId) {
  try {
    console.log('Processing uploaded data:', data);

    // Start transaction
    await new Promise((resolve, reject) => {
      db.beginTransaction((err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // Process tours
    for (const tour of data.tours) {
      const result = await new Promise((resolve, reject) => {
        db.query(
          'INSERT INTO tours (art_id, name, place, income, date) VALUES (?, ?, ?, ?, ?)',
          [tour.art_id, tour.name, tour.place, tour.income, tour.date],
          (err, result) => {
            if (err) reject(err);
            else resolve(result);
          }
        );
      });

      const tourId = result.insertId;

      // Process related pre-tour entries
      const preTourEntries = data.preTour.filter(entry => !entry.tour_id);
      for (const entry of preTourEntries) {
        await new Promise((resolve, reject) => {
          db.query(
            'INSERT INTO pre_tour (tour_id, art_id, statements, link) VALUES ( ?, ?, ?, ?)',
            [tourId, tour.art_id, entry.statements, entry.link, entry.status],
            (err, result) => {
              if (err) reject(err);
              else resolve(result);
            }
          );
        });
      }

      // Process related tax-variation entries
      const taxVariationEntries = data.taxVariation.filter(entry => !entry.tour_id);
      for (const entry of taxVariationEntries) {
        await new Promise((resolve, reject) => {
          db.query(
            'INSERT INTO tax_variation (tour_id, art_id, country, task_name, date, task_link) VALUES (?, ?, ?, ?, ?, ?)',
            [tourId, artistId, entry.country, entry.task, entry.due_date, entry.link, entry.status],
            (err, result) => {
              if (err) reject(err);
              else resolve(result);
            }
          );
        });
      }

      // Process related contractors entries
      const contractorsEntries = data.contractors.filter(entry => !entry.tour_id);
      for (const entry of contractorsEntries) {
        await new Promise((resolve, reject) => {
          db.query(
            'INSERT INTO contractor (tour_id, art_id, payment, people, trip_country, people_oversea, trip_oversea, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [tourId, artistId, entry.payment, entry.domestic_people, entry.domestic_trips, entry.overseas_people, entry.overseas_trips, entry.notes],
            (err, result) => {
              if (err) reject(err);
              else resolve(result);
            }
          );
        });
      }

      // Process related insurance entries
      const insuranceEntries = data.insurance.filter(entry => !entry.tour_id);
      for (const entry of insuranceEntries) {
        await new Promise((resolve, reject) => {
          db.query(
            'INSERT INTO insurance (tour_id, art_id, liability_notes, insurance_notes, equipment_notes, workcover_notes) VALUES (?, ?, ?, ?, ?, ?)',
            [tourId, artistId, entry.liability_notes, entry.insurance_notes, entry.equipment_notes, entry.workcover_notes],
            (err, result) => {
              if (err) reject(err);
              else resolve(result);
            }
          );
        });
      }

      // Process post-tour entries
      const postTourEntries = data.postTour.filter(entry => !entry.tour_id);
      for (const entry of postTourEntries) {
        await new Promise((resolve, reject) => {
          db.query(
            'INSERT INTO post_tour (tour_id, art_id, name, link) VALUES (?, ?, ?, ?)',
            [tourId, artistId, entry.statements, entry.link, entry.status],
            (err, result) => {
              if (err) reject(err);
              else resolve(result);
            }
          );
        });
      }
      // Commit transaction
      await new Promise((resolve, reject) => {
        db.commit((err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    }
  } catch (error) {
    await new Promise((resolve, reject) => {
      db.rollback((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    throw error;
  }
}
// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});