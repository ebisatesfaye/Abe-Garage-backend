// import the express module
const express = require('express');
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccount.json');
// import the mysql module
const mysql = require('mysql2');
const app = express();
const { getFirestore } = require('firebase-admin/firestore');



admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// console.log("Firebase Admin SDK initialized");
// conneted to the firestore database
const db = getFirestore();
if (!db) {
  console.error("Firestore database connection failed!");
} else {
    console.log("Firestore database connected successfully!");
}
// define the database connection parameters
const dbConfig = {
    connectionLimit: 10,
    host: 'localhost',
    user: 'root',
    password: '1995921@ebisa',
    database: 'garage',
}
// allow CORS to all
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
        "Access-Control-Allow-Methods",
        "OPTIONS, GET, POST, PUT, PATCH, DELETE" // what matters here is that OPTIONS is present
    );
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    next();
});

// create a connection pool to the database
const pool = mysql.createConnection(dbConfig);
//Connect to the database
pool.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to the database!');
});

app.use(express.json()); // Middleware to parse JSON request bodies

// create a simple get request handler to send a response
app.get('/', (req, res) => {
    res.send('Hello, this is a simple GET request response!');
  });
 
// post request handler to add a new employee to the database
// app.post('/add-employee', (req, res) => {
//     console.log(req.body);
//     // write the SQL query to add to the database table named employee_test
//     const sql = `INSERT INTO employee_test (first_name, last_name, email, password) VALUES ('${req.body.first_name}', '${req.body.last_name}', '${req.body.email}', '${req.body.password}')`;
//     // execute the query
//     pool.query(sql, (err, res) => {
//         if (err) throw err;
//         console.log('1 record inserted');
//     });
//     // send a response back to the client
//     const response = {
//         status: 'success',
//         message: 'Employee added successfully',
//     };
//     res.status(200).json(response);

// });

// post request handler to add a new employee to the firestore database
app.post('/add-employee', async (req, res) => {
  const { first_name, last_name, email, password } = req.body;
  console.log(req.body);

  try {
    await db.collection("garage")
      .doc("employee")
      .collection("list")
      .add({
        first_name,
        last_name,
        email,
        password
      });

    res.status(200).json({
      status: 'success',
      message: 'Employee added successfully!',
    });

  } catch (error) {
    console.error('Error adding employee:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while adding employee.',
    });
  }
});

// Post request handler to login an employee which comes to /login from database
// app.post('/login', (req, res) => {
//     console.log(req.body);
//     // write the SQL query to retrive the employee with the email and password provided by the user and compare it with the database
//     const sql = `SELECT * FROM employee_test WHERE email = '${req.body.email}' AND password = '${req.body.password}'`;
//     // execute
//     pool.query(sql, (err, result) => {
//         if (err) throw err;
//         console.log('Employee logged in');
//         if (result.length > 0) {
//             const response = {
//                 status: 'success',
//                 message: 'Login successful!',
//             };
//             // Send the response back to the client
//             res.status(200).json(response);
//         } else {
//             const response = {
//                 status: 'error',
//                 message: 'Invalid email or password!',
//             };
//             // Send the response back to the client
//             res.status(401).json(response);
//         }
//     });



// });

// login request handler for firebase firestore database
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    console.log(req.body);
  
    try {
      const snapshot = await db.collection("garage")
        .doc("employee")
        .collection("list")
        .where("email", "==", email)
        .where("password", "==", password)
        .get();
  
      if (!snapshot.empty) {
        res.status(200).json({
          status: 'success',
          message: 'Login successful!',
        });
      } else {
        res.status(401).json({
          status: 'error',
          message: 'Invalid email or password!',
        });
      }
    } catch (error) {
      console.error("Error logging in: ", error);
      res.status(500).json({
        status: 'error',
        message: 'Server error.',
      });
    }
  });
  


const PORT = 5000;
// set up the listener
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));

