import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export async function POST(req: Request) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Improved headers to help bypass basic blocks like Adidas
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
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
    let ogImage = $('meta[property="og:image"]').attr('content') || '';

    // Extract all potential product images from img tags
    let images: string[] = [];
    $('img').each((i, el) => {
      const src = $(el).attr('src') || $(el).attr('data-src');
      if (src && src.startsWith('http') && !src.includes('.svg') && !src.includes('icon') && !src.includes('logo')) {
        if (!images.includes(src)) images.push(src);
      }
    });

    // Ensure the main OG image is the first one
    if (ogImage) {
      images = images.filter(img => img !== ogImage);
      images.unshift(ogImage);
    }

    // Attempt to extract brand from title or URL
    let brand = '';
    const lowercaseTitle = title.toLowerCase();
    const lowercaseUrl = url.toLowerCase();
    
    if (lowercaseTitle.includes('nike') || lowercaseUrl.includes('nike.com')) brand = 'Nike';
    else if (lowercaseTitle.includes('adidas') || lowercaseUrl.includes('adidas.com') || lowercaseUrl.includes('adidas.co')) brand = 'Adidas';
    else if (lowercaseTitle.includes('jordan')) brand = 'Jordan';
    else if (lowercaseTitle.includes('new balance') || lowercaseUrl.includes('newbalance.com')) brand = 'New Balance';

    return NextResponse.json({
      success: true,
      data: {
        title: title.trim(),
        description: description.trim(),
        image: ogImage.trim(),
        images: images,
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
