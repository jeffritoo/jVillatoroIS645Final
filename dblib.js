// Add packages
require("dotenv").config();
// Add database package and connection string
const { Pool } = require('pg');
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

//TOTAL NUMBER OF CUSTOMERS//

const getTotalRecords = () => {
    sql = "SELECT COUNT(*) FROM book";
    return pool.query(sql)
        .then(result => {
            return {
                msg: "success",
                totRecords: result.rows[0].count
            }
        })
        .catch(err => {
            return {
                msg: `Error: ${err.message}`
            }
        });
};



const insertProduct = (book) => {
    // Will accept either a product array or product object
    if (book instanceof Array) {
        params = book;
    } else {
        params = Object.values(book);
    };

   // console.log("param is:", params);

    const sql = `INSERT INTO book (book_id, title, total_pages, rating, isbn, published_date)
                 VALUES ($1, $2, $3, $4, $5, $6)`;

    return pool.query(sql, params)
        .then(res => {
            return {
                trans: "success", 
                msg: `Book id ${params[0]} successfully inserted`
            };
        })
        .catch(err => {
            return {
                trans: "fail", 
                msg: `Error on insert of book id ${params[0]}.  ${err.message}`
            };
        });
};


function sumSeries(p1,p2,p3){
  
    let lowerLimit = p1;
    let upperLimit = p2;
    
      
    var sum=lowerLimit;
    let increment = sum + p3;
    
    for(i=1; i<=upperLimit; i++){
    sum += (lowerLimit+increment);
    }
    
    
      return sum;
    
 }





// Add this at the bottom
module.exports.getTotalRecords = getTotalRecords;
module.exports.insertProduct = insertProduct;
