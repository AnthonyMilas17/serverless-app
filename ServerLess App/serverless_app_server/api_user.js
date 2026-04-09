//
// app.put('/user', async (req, res) => {...});
//
// Inserts a new user into the database, or if the
// user already exists (based on email) then the
// user's data is updated (name and bucket folder).
// Returns the user's userid in the database.
//
const photoapp_db = require('./photoapp_db.js')

exports.put_user = async (req, res) => {

  console.log("**Call to put /user...");

  try {

    let data = req.body;  // data => JS object

    console.log(data);

    const { email, lastname, firstname, bucketfolder } = data;
    console.log("Email:", email);
    sql = 'SELECT userid FROM users WHERE email = ?';
    photoapp_db.query(sql, [email], (err, rows) => {
      if(err){
        res.status(400).json({
          "message": err.message,
          "userid": [],
        })
        return;
      }
      if (rows.length == 0){
        sql = 'INSERT INTO users(email, lastname, firstname, bucketfolder) values(?, ?, ?, ?)';
        photoapp_db.query(sql, [email, lastname, firstname, bucketfolder], (err, entry) =>{
          if(err){
            res.status(400).json({
              "message": err.message,
              "userid": -1,
            })
            return;
          }
          res.json({
            "message": "inserted",
            "userid": entry.insertId,
          });
        });
      }
      else{
        sql = 'UPDATE users SET lastname = ?, firstname = ?, bucketfolder = ? where email = ?'
        photoapp_db.query(sql, [lastname, firstname, bucketfolder, email], (err, entry) =>{
          if(err){
            res.status(400).json({
              "message": err.message,
              "userid": -1,
            })
            return;
          }
          res.json({
            "message": "updated",
            "userid": rows[0]['userid'],
          });
        });
      }
    });
  
	
  }//try
  catch (err) {
    console.log("**Error in /user");
    console.log(err.message);

    res.status(500).json({
      "message": err.message,
      "userid": -1
    });
  }//catch

}//put
