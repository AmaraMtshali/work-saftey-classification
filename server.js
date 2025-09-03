const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/predict-scene', async (req, res) => {
  try {
    
    const { image_url } = req.body || {};

    if (!image_url) {
      return res.status(400).json({ error: 'No image_url provided' });
    }

    // Download image
    const imageResponse = await axios.get(image_url, {
      responseType: 'arraybuffer',
      timeout: 10000,
    });
    const base64Image = Buffer.from(imageResponse.data).toString('base64');

    // Send to Roboflow API
    const response = await axios({
      method: 'POST',
      url: 'https://serverless.roboflow.com/construction-site-safety/27',
      params: { api_key: 'SDvW81XMHkIPZNwp3wg9' },
      data: base64Image,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    // Extract only the class names
    const predictions = response.data.predictions || [];
    const classes = predictions.map((p) => p.class);

    res.json({ classes });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Prediction failed: ' + error.message });
  }
});

app.get('/', (req, res) => {
  res.send('Backend is running');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
