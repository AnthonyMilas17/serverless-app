const crypto = require('crypto');
const photoapp_db = require('./photoapp_db.js');
const { GetObjectCommand } = require('@aws-sdk/client-s3');
const { photoapp_s3, s3_bucket_name, s3_region_name } = require('./photoapp_s3.js');

function deriveKey(password, salt) {
    return crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256');
}

// Helper function to decrypt data
function decryptData(encryptedData, iv, password, salt) {
    const key = deriveKey(password, salt);
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, Buffer.from(iv, 'hex'));

    let decrypted = Buffer.concat([
        decipher.update(Buffer.from(encryptedData, 'base64')),
        decipher.final()
    ]);

    return decrypted;
}

exports.decrypt_asset = async (req, res) => {
    console.log("**Call to get /decrypt/:assetid...");

    try {
        const { assetid } = req.params;
        const { password } = req.body; 

        if (!password) {
            res.status(400).json({ message: "Password is required for decryption." });
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
            console.log(result.ContentType); // Check if it's 'application/json' or something else

           // Read the Body stream into a Buffer
            const chunks = [];
            for await (const chunk of result.Body) {
                chunks.push(chunk);
            }
            const encryptedBuffer = Buffer.concat(chunks);

            // Assume the encrypted buffer contains the salt, IV, and encrypted data concatenated
            const SALT_LENGTH = 16; // Adjust based on your encryption setup
            const IV_LENGTH = 16;   // Adjust based on your encryption setup

            // Extract salt, IV, and encrypted data from the buffer
            const salt = encryptedBuffer.slice(0, SALT_LENGTH);
            const iv = encryptedBuffer.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
            const encryptedData = encryptedBuffer.slice(SALT_LENGTH + IV_LENGTH);

            var decryptedImage = null
            try {
                decryptedImage = decryptData(encryptedData, iv, password, salt);
            } catch (err) {
                console.error("**Error in /decrypt/:assetid");
                console.error(err.message);

                res.status(500).json({
                    message: err.message,
                    user_id: -1,
                    asset_name: "?",
                    bucket_key: "?",
                    data: []
                });
                return;
            }
            

            const datastr = decryptedImage.toString('base64');

            res.json({
                message: "success",
                user_id: userid,
                asset_name: assetname,
                bucket_key: bucketkey,
                data: datastr
            });

            console.log("/decrypt/:assetid done, sending decrypted response...");
        });
    } catch (err) {
        console.error("**Error in /decrypt/:assetid");
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
