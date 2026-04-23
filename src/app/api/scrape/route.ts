import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export async function POST(req: Request) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Fetch the HTML content
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch the URL. Status: ${response.status}`);
    }

    const html = await response.text();
    
    // Load HTML into cheerio
    const $ = cheerio.load(html);

    // Extract Open Graph Data
    const title = $('meta[property="og:title"]').attr('content') || $('title').text() || '';
    const description = $('meta[property="og:description"]').attr('content') || $('meta[name="description"]').attr('content') || '';
    const image = $('meta[property="og:image"]').attr('content') || '';

    // Attempt to extract brand from title or URL
    let brand = '';
    const lowercaseTitle = title.toLowerCase();
    const lowercaseUrl = url.toLowerCase();
    
    if (lowercaseTitle.includes('nike') || lowercaseUrl.includes('nike.com')) brand = 'Nike';
    else if (lowercaseTitle.includes('adidas') || lowercaseUrl.includes('adidas.com')) brand = 'Adidas';
    else if (lowercaseTitle.includes('jordan')) brand = 'Jordan';
    else if (lowercaseTitle.includes('new balance') || lowercaseUrl.includes('newbalance.com')) brand = 'New Balance';

    return NextResponse.json({
      success: true,
      data: {
        title: title.trim(),
        description: description.trim(),
        image: image.trim(),
        brand,
      }
    });

  } catch (error) {
    console.error('Scraping error:', error);
    return NextResponse.json(
      { error: 'Failed to scrape the website. It might be blocking automated requests.' }, 
      { status: 500 }
    );
  }
}
