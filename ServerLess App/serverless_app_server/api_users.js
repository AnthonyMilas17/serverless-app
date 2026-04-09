//
// app.get('/users', async (req, res) => {...});
//
// Return all the users from the database:
//
const photoapp_db = require('./photoapp_db.js')

exports.get_users = async (req, res) => {

  console.log("**Call to get /users...");

  try {
    
    const sql = 'Select * FROM users ORDER BY userid ASC';
    photoapp_db.query(sql, (err, rows) => {
      if(err){
        res.status(400).json({
          "message": err.message,
          "data": [],
        })
        return;
      }
      res.json({
        "message": "success",
        "data": rows,
      });
    });
    console.log("/users done, sending response...");

    

  }//try
  catch (err) {
    console.log("**Error in /users");
    console.log(err.message);
    
    res.status(500).json({
      "message": err.message,
      "data": []
    });
  }//catch

}//get
