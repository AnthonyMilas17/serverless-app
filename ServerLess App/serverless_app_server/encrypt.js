const crypto = require('crypto');
const { Readable } = require('stream');
const photoapp_db = require('./photoapp_db.js');
const { GetObjectCommand } = require('@aws-sdk/client-s3');
const { photoapp_s3, s3_bucket_name, s3_region_name } = require('./photoapp_s3.js');

const IV_LENGTH = 16; 
const SALT_LENGTH = 16;
const ALGORITHM = 'aes-256-cbc';

// Function to convert a readable stream to a buffer
async function streamToBuffer(stream) {
    const chunks = [];
    for await (const chunk of stream) {
        chunks.push(chunk);
    }
    return Buffer.concat(chunks);
}


function deriveKey(password, salt) { //another helper, only kinda sure this works
    return crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256'); 
}

function encryptBuffer(dataBuffer, password) { //last helper, really not sure
    const salt = crypto.randomBytes(SALT_LENGTH); 
    const iv = crypto.randomBytes(IV_LENGTH); 
    const key = deriveKey(password, salt); 

    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    let encryptedData = cipher.update(dataBuffer);
    encryptedData = Buffer.concat([encryptedData, cipher.final()]);

    return Buffer.concat([salt, iv, encryptedData]);
}

exports.encrypt_asset = async (req, res) => {
    console.log("**Call to get /encrypt/:assetid...");

    try {
        const { assetid } = req.params;
        const { password } = req.body;
        console.log("req.body is " + password);

        if (!password) {
            res.status(400).json({ message: "Password is required for encryption." });
            return;
        }

        const sql = 'SELECT * FROM assets WHERE assetid = ?';
        photoapp_db.query(sql, [assetid], async (err, rows) => {
            if (err) {
                console.error("**Database error:", err.message);
                res.status(500).json({ message: "Database error", data: [] });
                return;
            }

            if (rows.length === 0) {
                res.status(400).json({
                    message: "No such asset...",
                    user_id: -1,
                    asset_name: "?",
                    bucket_key: "?",
                    data: []
                });
                return;
            }

            const { userid, assetname, bucketkey } = rows[0]; // Destructure to get userid and bucketkey

            const getObjectParams = {
                Bucket: s3_bucket_name,
                Key: bucketkey,
            };
            const getObjectCommand = new GetObjectCommand(getObjectParams);
            const result = await photoapp_s3.send(getObjectCommand);
            const imageBuffer = await streamToBuffer(result.Body);

            // Encrypt the image
            const encryptedImage = encryptBuffer(imageBuffer, password);

            res.json({
                message: "success",
                user_id: userid,
                asset_name: assetname,
                bucket_key: bucketkey,
                data: encryptedImage.toString('base64') // Convert to base64 for JSON response
            });

            console.log("/encrypt/:assetid done, sending encrypted response...");
        });
    } catch (err) {
        console.error("**Error in /encrypt/:assetid");
        console.error(err.message);

        res.status(500).json({
            message: err.message,
            user_id: -1,
            asset_name: "?",
            bucket_key: "?",
            data: []
        });
    }
};
