const express = require('express');
const cors = require('cors');
const Minio = require('minio');
const dotenv = require('dotenv');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT || 'minio',
  port: parseInt(process.env.MINIO_PORT) || 9000,
  useSSL: false,
  accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
  secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin'
});

const bucketName = process.env.MINIO_BUCKET || 'uploads';

// Ensure bucket exists
(async () => {
  try {
    const exists = await minioClient.bucketExists(bucketName);
    if (!exists) {
      await minioClient.makeBucket(bucketName);
      console.log('Bucket created successfully');
    }
  } catch (err) {
    console.error('Error creating bucket:', err);
  }
})();

app.get('/presigned-url', async (req, res) => {
  try {
    const fileName = req.query.name;
    if (!fileName) {
      return res.status(400).json({ error: 'Filename is required' });
    }

    const presignedUrl = await minioClient.presignedPutObject(
      bucketName,
      fileName,
      60 * 60 // URL expires in 1 hour
    );

    res.json({ url: presignedUrl });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    const fileName = file.originalname;

    await minioClient.putObject(
      bucketName,
      fileName,
      file.buffer,
      file.size,
      file.mimetype
    );

    res.json({ 
      success: true, 
      filename: fileName,
      path: `eventimagebucket/${fileName}`
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT =  8091;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
