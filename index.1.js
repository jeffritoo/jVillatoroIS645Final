// Add required packages
const express = require("express");
const app = express();
require('dotenv').config()
const dblib = require("./dblib.js");

const multer = require("multer");
const upload = multer();

// Add middleware to parse default urlencoded form
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Set up EJS
app.set("view engine", "ejs");

// Add database package and connection string (can remove ssl)
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Start listener
app.listen(process.env.PORT || 3002, () => {
    console.log("Server started (http://localhost:3002/) !");
});

// Setup routes
app.get("/", (req, res) => {
    //res.send ("Hello world...");
    res.render("index");
});


app.get("/sum", (req, res) => {
    //res.send("Root resource - Up and running!")
    res.render("sum");
});

// //INPUT FROM LOCAL FILE AJAX//

app.get("/import", async (req, res) => {
    res.render("input", {
      type:"get",
      totRecs: totRecs.totRecords,
    });
  });
  
  app.post("/input",  upload.single('filename'), async (req, res) => {
     if(!req.file || Object.keys(req.file).length === 0) {
         message = `Error: Import file not uploaded ${req.file}`;
         return res.json({
           message: message,
          });
  
     };
     //Read file line by line, inserting records
     const buffer = req.file.buffer; 
     const rows = buffer.toString().split(/\r?\n/);
  
     var numRecFail = 0;
     var numRecSuccess = 0;
     var errorMessage = [];
  
     for(let row of rows){
        product = row.split(",");
        let result = await dblib.insertProduct(product);
        if(result.trans === "success"){
          numRecSuccess++;
        } else{ 
          console.log(result);
          numRecFail++;
          errorMessage.push(result.msg);
        }
     }
     const totRecs = await dblib.getTotalRecords();
  //response in form of key value pairs
     res.json({
       type: "post",
       numRecFail: numRecFail,
       numRecSuccess: numRecSuccess,
       errorMessage: errorMessage,
       totRecs: totRecs.totRecords,
     });
    });
  














// app.get("/data", (req, res) => {
//     //res.send ("Hello world...");
//     const sql = "SELECT * FROM PRODUCT ORDER BY PROD_ID";
//     pool.query(sql, [], (err, result) => {
//         var message = "";
//         var model = {};
//         if(err) {
//             console.log("err is:", err);
//             message = `Error - ${err.message}`;
//         } else {
//             console.log("result is: ", result);
//             console.log("result.rows is: ", result.rows);
//             message = "success";
//             model = result.rows;
//         };
//         res.render("data", {
//             message: message,
//             model : model
//         });
//     });
// });