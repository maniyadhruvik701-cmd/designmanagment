const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/scrape', async (req, res) => {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  try {
    const { data } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    const $ = cheerio.load(data);

    // Basic extraction
    const title = $('meta[property="og:title"]').attr('content') || $('title').text() || '';
    const description = $('meta[property="og:description"]').attr('content') || $('meta[name="description"]').attr('content') || '';
    const photo = $('meta[property="og:image"]').attr('content') || '';
    
    // Heuristic price extraction
    let priceText = '';
    
    if (url.includes('amazon')) {
      priceText = $('.a-price-whole').first().text() || $('#priceblock_ourprice').text() || $('.a-price .a-offscreen').first().text();
    } else if (url.includes('flipkart')) {
      priceText = $('div._30jeq3').first().text() || $('div.Nx9bqj').first().text();
    } else {
      // Generic fallback - try to find elements with dollar or rupee signs
      const priceRegex = /[\$₹]\s?\d+(?:,\d{3})*(?:\.\d{2})?/;
      $('span, div, p').each((i, el) => {
        const text = $(el).text();
        if (priceRegex.test(text) && text.length < 20) {
          priceText = text.trim();
          return false; // Break loop
        }
      });
    }

    // Clean price
    const priceNumber = parseInt(priceText.replace(/[^0-9]/g, ''), 10) || '';

    // Determine platform
    let platform = 'Other';
    if (url.includes('amazon')) platform = 'Amazon';
    else if (url.includes('etsy')) platform = 'Etsy';
    else if (url.includes('shopify')) platform = 'Shopify';

    res.json({
      title,
      description,
      photo,
      price: priceNumber,
      platform
    });

  } catch (error) {
    console.error('Error scraping URL:', error.message);
    res.status(500).json({ error: 'Failed to scrape URL' });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Scraper backend running on port ${PORT}`);
});
