const sharp = require('sharp');
const photoapp_db = require('./photoapp_db.js')
const { GetObjectCommand } = require('@aws-sdk/client-s3');
const { photoapp_s3, s3_bucket_name, s3_region_name } = require('./photoapp_s3.js');

// Function to convert a readable stream to a buffer
async function streamToBuffer(stream) {
  const chunks = [];
  for await (const chunk of stream) {
      chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

exports.compress_asset =  async (req, res) => {
    console.log("**Call to get /compress/:assetid...");

    try {
        const { assetid } = req.params
        const sql = 'Select * FROM assets where assetid = ?';
        photoapp_db.query(sql, [assetid], async (err, rows) => {
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

          const imageBuffer = await streamToBuffer(result.Body);
          const compressedBuffer = await sharp(imageBuffer).jpeg({ quality: 50 }).toBuffer();

          const datastr = await compressedBuffer.toString('base64') // Convert to base64 for JSON response
    
          res.json({
            "message": "success",
            "user_id": userid,
            "asset_name": assetname,
            "bucket_key": bucketkey,
            "data": datastr
          });
    
        console.log("/compress_asset done, sending response...");
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
    
}