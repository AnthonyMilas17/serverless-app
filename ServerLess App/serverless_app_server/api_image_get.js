//
// app.get('/image/:assetid', async (req, res) => {...});
//
// downloads an asset from S3 bucket and sends it back to the
// client as a base64-encoded string.
//
const photoapp_db = require('./photoapp_db.js')
const { GetObjectCommand } = require('@aws-sdk/client-s3');
const { photoapp_s3, s3_bucket_name, s3_region_name } = require('./photoapp_s3.js');

exports.get_image = async (req, res) => {

  console.log("**Call to get /image/:assetid...");

  try {

    // const id = req.params.assetid;
    const { assetid } = req.params
    // console.log("id result:", id);
    const sql = 'Select * FROM assets where assetid = ?';
    photoapp_db.query(sql, [assetid], async (err, rows) => {
      // console.log("Database query result:", rows);
      if (rows.length === 0) {
        res.status(400).json({ 
          "message": "no such asset...",
          "user_id": -1,
          "asset_name": "?",
          "bucket_key": "?",
          "data": []
        });
        return;
      }
      const { userid, assetname , bucketkey } = rows[0]; // Destructure to get userid and bucketkey
      
      const getObjectParams = {
        Bucket: s3_bucket_name,
        Key: bucketkey,
      };
      const getObjectCommand = new GetObjectCommand(getObjectParams);
      const result = await photoapp_s3.send(getObjectCommand);
      const datastr = await result.Body.transformToString("base64"); // Convert to base64

      // Send the response back to the client
      res.json({
        "message": "success",
        "user_id": userid,
        "asset_name": assetname,
        "bucket_key": bucketkey,
        "data": datastr
      });

    console.log("/image_get done, sending response...");
    });

  }//try
  catch (err) {
    console.log("**Error in /image");
    console.log(err.message);
    
    res.status(500).json({
      "message": err.message,
      "user_id": -1,
      "asset_name": "?",
      "bucket_key": "?",
      "data": []
    });
  }//catch

}//get