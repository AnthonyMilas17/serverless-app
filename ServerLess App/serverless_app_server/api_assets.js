//
// app.get('/assets', async (req, res) => {...});
//
// Return all the assets from the database:
//
const photoapp_db = require('./photoapp_db.js')

exports.get_assets = async (req, res) => {

  console.log("**Call to get /assets...");

  try {

    const sql = 'Select * FROM assets ORDER BY assetid ASC';
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
    console.log("/assets done, sending response...");

    

  }//try
  catch (err) {
    console.log("**Error in /assets");
    console.log(err.message);
    
    res.status(500).json({
      "message": err.message,
      "data": []
    });
  }//catch

}//get
