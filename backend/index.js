const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

const MCP_API_KEY = process.env.MCP_API_KEY;
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const SENDER_EMAIL = process.env.SENDER_EMAIL;

app.use(express.json());

app.post('/sendMail', async (req, res) => {
  const { to, subject, body, key } = req.body;

  if (key !== MCP_API_KEY) {
    return res.status(403).json({ error: 'Invalid API Key' });
  }

  try {
    const response = await axios.post(
      'https://api.sendgrid.com/v3/mail/send',
      {
        personalizations: [{ to: [{ email: to }] }],
        from: { email: SENDER_EMAIL },
        subject,
        content: [{ type: 'text/plain', value: body }]
      },
      {
        headers: {
          Authorization: `Bearer ${SENDGRID_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    res.json({ status: 'Email sent successfully' });
  } catch (error) {
    console.error('SendGrid Error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to send email', details: error.response?.data });
  }
});

app.listen(PORT, () => {
  console.log(`✅ MCP server running at http://localhost:${PORT}`);
});
