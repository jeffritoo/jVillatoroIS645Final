// Required modules 
const express = require("express");
const app = express();
const dblib = require("./dblib.js");

const multer = require("multer");
const upload = multer();



const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Add middleware to parse default urlencoded form
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Setup EJS
app.set("view engine", "ejs");

// Enable CORS (see https://enable-cors.org/server_expressjs.html)
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
    );
    next();
});

// Application folders
app.use(express.static("public"));

// Start listener
app.listen(process.env.PORT || 3004, () => {
    console.log("Server started (http://localhost:3004/) !");
});

// Setup routes
app.get("/", (req, res) => {
    //res.send("Root resource - Up and running!")
    res.render("index");
});

app.get("/sum", async (req, res) => {
    // Omitted validation check

    //Create an empty product object (To populate form with values)
    const numbers = {
        starting: "",
        ending: "",
        increment: "",
    };
    res.render("sum", {
        type: "get",
        num: num
    });
});


app.post("/sum", async (req, res) => {
    // Omitted validation check
    //  Can get this from the page rather than using another DB call.
    //  Add it as a hidden form value.

    
    // console.log("POST Customer, req.body is:", req.body);

    dblib.findProducts(req.body)
        .then(result => {
            console.log("result from findProducts is:", result);
            res.render("sum", {
                type: "post",
                result: result,
                num: req.body
            })
        })
        .catch(err => {
            res.render("sum", {
                type: "post",
                result: `Unexpected Error: ${err.message}`,
                num: req.body
            });
        });
});

//INPUT FROM LOCAL FILE AJAX//

app.get("/input", async (req, res) => {
  const totRecs = await dblib.getTotalRecords();
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
      book = row.split(",");
      NULL = null;

      if (book.length) {
        // here I am trying to handle the null value issue
        for (var i = 0; i < book.length; i++) {
          if (book[i] === "Null" || book[i] === '' || book[i] === '' ) {
            book[i] = NULL;
          }
        }
      }


      // book.forEach(books => {
      //   var index = books.indexOf("Null");
      //   books[index] = "null";
      // });

      // console.log("This is what row print out");
      // console.log(row.split(","));
    
      let result = await dblib.insertProduct(book);
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

// //EDIT CUSTOMER
// app.get("/edit/:id", (req, res) => {
//     const id = req.params.id;
//     const sql = "SELECT * FROM customer WHERE cusid = $1";
//     pool.query(sql, [id], (err, result) => {
//       // if (err) ...
//       res.render("edit", { model: result.rows[0] });
//     });
//   });
  
//   // POST /edit/5
//   app.post("/edit/:id", (req, res) => {
//     const id = req.params.id;
//     const customer = [req.body.cusid, req.body.cusfname, req.body.cuslname, req.body.cusstate, req.body.cussalesytd, req.body.cussalesprev, id];
//     const sql = "UPDATE Customer SET Cusid = $1, Cusfname = $2, Cuslname = $3, Cusstate = $4, Cussalesytd = $5, Cussalesprev = $6 WHERE (Cusid = $7)";
//     pool.query(sql, customer, (err, result) => {
//       // if (err) ...
//       res.redirect("/customer");
//     });
//   });

// // GET /create
// app.get("/create", (req, res) => {
//     const customer = {
//       cusfname: "Victor Hugo"
//     }
//     res.render("create", { model: customer });
//   });
  
//   // POST /create
//   app.post("/create", (req, res) => {
//     const sql = "INSERT INTO customer (cusid, cusfname, cuslname, cusstate, cussalesytd, cussalesprev) VALUES ($1, $2, $3, $4, $5, $6)";
//     const customer = [req.body.cusid, req.body.cusfname, req.body.cuslname, req.body.cusstate, req.body.cussalesytd, req.body.cussalesprev];
//     pool.query(sql, customer, (err, result) => {
//       if (err){
//         console.log("err is:", err);
//         message = `Error - ${err.message}`;
//       } else{
//         console.log("result is:", res);
//         console.log("result.rows", res.rows);
//         message = "success";
//         model = result.rows;
//       };
//       res.render("create", {
//         type: "post",
//         message: message,
//         model:model
//       });
//     });
//   });

// // GET /delete/5
// app.get("/delete/:id", (req, res) => {
//   const id = req.params.id;
//   const sql = "SELECT * FROM customer WHERE cusid = $1";
//   pool.query(sql, [id], (err, result) => {
//     // if (err) ...
//     res.render("delete", { model: result.rows[0] });
//   });
// });

// // POST /delete/5
// app.post("/delete/:id", (req, res) => {
//   const id = req.params.id;
//   const sql = "DELETE FROM customer WHERE cusid = $1";
//   pool.query(sql, [id], (err, result) => {
//     var message = "";
//     // if (err) ...
//     res.redirect("/customer");
//   });
// });



//    lines.forEach(line => {
//         //console.log(line);
//         product = line.split(",");
//         //console.log(product);
//         const sql = "INSERT INTO customer(cusid, cusfname, cuslname, cusstate, cussalesytd, cussalesprev) VALUES ($1, $2, $3, $4, $5, $6)";
//         pool.query(sql, product, (err, result) => {
//             if (err) {
//                 console.log(`Insert Error.  Error message: ${err.message}`);
//             } else {
//                 console.log(`Inserted successfully`);
//             }
//        });
//    });
//    message = `Processing Complete - Processed ${lines.length} records`;
//    res.send(message);
// });


// //OUTPUT ALL DATABASE RECORDS TO .CSV//
// app.get("/output", (req, res) => {
//   var filename = "export.csv";
  
//   var message = "";
//   res.render("output",{ message: message, filename:filename});
  
//  });
 
 
//  app.post("/output", (req, res) => {
//      const sql = "SELECT * FROM CUSTOMER ORDER BY CUSID";
//      pool.query(sql, [], (err, result) => {
//          var message = "";
//          var filename = filename;
//          if(err) {
//              message = `Error - ${err.message}`;
//              res.render("output", { message: message })
//          } else {
//              var output = "";
//              result.rows.forEach(customer => {
//                  output += `${customer.cusid},${customer.cusfname},${customer.cuslname},${customer.cusstate},${customer.cussalesytd},${customer.cussalesprev}\r\n`;
//              });
//              res.header("Content-Type", "text/csv");
//              res.attachment("export.csv");
//              return res.send(output);
//          };
//      });
//  });






// app.get("/searchajax", async (req, res) => {
//     // Omitted validation check
//     const totRecs = await dblib.getTotalRecords();
//     res.render("searchajax", {
//         totRecs: totRecs.totRecords,
//     });
// });

// app.post("/searchajax", upload.array(), async (req, res) => {
//     dblib.findProducts(req.body)
//         .then(result => res.send(result))
//         .catch(err => res.send({trans: "Error", result: err.message}));

// });