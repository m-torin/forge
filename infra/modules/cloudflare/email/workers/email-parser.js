/**
 * Email Parser Worker
 * Extracts and processes structured data from emails
 */

export default {
  async email(message, env, ctx) {
    const config = {
      parseAttachments: ${parse_attachments},
      extractLinks: ${extract_links},
      extractPhoneNumbers: ${extract_phone_numbers},
      extractDates: ${extract_dates},
      detectLanguage: ${detect_language}
    };
    
    try {
      const parsedData = {
        messageId: message.headers.get('Message-ID'),
        from: message.from,
        to: message.to,
        subject: message.headers.get('Subject'),
        timestamp: new Date().toISOString(),
        headers: {}
      };
      
      // Parse headers
      for (const [key, value] of message.headers) {
        parsedData.headers[key.toLowerCase()] = value;
      }
      
      // Parse body content
      const bodyText = await message.text();
      parsedData.bodyText = bodyText;
      
      // Extract structured data based on configuration
      if (config.extractLinks) {
        parsedData.links = extractLinks(bodyText);
      }
      
      if (config.extractPhoneNumbers) {
        parsedData.phoneNumbers = extractPhoneNumbers(bodyText);
      }
      
      if (config.extractDates) {
        parsedData.dates = extractDates(bodyText);
      }
      
      if (config.detectLanguage) {
        parsedData.language = await detectLanguage(bodyText, env);
      }
      
      // Parse attachments
      if (config.parseAttachments && message.parts) {
        parsedData.attachments = await parseAttachments(message.parts);
      }
      
      // Extract entities (people, organizations, locations)
      parsedData.entities = extractEntities(bodyText);
      
      // Store parsed data if KV is available
      if (env.KV_EMAIL_DATA) {
        const key = `parsed:${parsedData.messageId}`;
        await env.KV_EMAIL_DATA.put(key, JSON.stringify(parsedData), {
          expirationTtl: 2592000 // 30 days
        });
      }
      
      // Send to webhook if configured
      if (env.PARSER_WEBHOOK_URL) {
        ctx.waitUntil(
          fetch(env.PARSER_WEBHOOK_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Email-Parser': 'v1'
            },
            body: JSON.stringify(parsedData)
          })
        );
      }
      
      // Forward original message
      await message.forward(message.to);
      
    } catch (error) {
      console.error('Email parser error:', error);
      await message.forward(message.to);
    }
  }
};

function extractLinks(text) {
  const urlRegex = /(https?:\/\/[^\s<>\"]+)/gi;
  const matches = text.match(urlRegex) || [];
  return [...new Set(matches)].map(url => ({
    url,
    domain: new URL(url).hostname
  }));
}

function extractPhoneNumbers(text) {
  const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}/g;
  const matches = text.match(phoneRegex) || [];
  return [...new Set(matches)].filter(num => num.replace(/\D/g, '').length >= 10);
}

function extractDates(text) {
  const dates = [];
  
  // Common date patterns
  const patterns = [
    /\d{1,2}\/\d{1,2}\/\d{2,4}/g,
    /\d{1,2}-\d{1,2}-\d{2,4}/g,
    /\d{4}-\d{2}-\d{2}/g,
    /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2},?\s+\d{4}/gi,
    /\d{1,2}\s+(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}/gi
  ];
  
  patterns.forEach(pattern => {
    const matches = text.match(pattern) || [];
    dates.push(...matches);
  });
  
  return [...new Set(dates)];
}

function extractEntities(text) {
  const entities = {
    emails: [],
    organizations: [],
    people: []
  };
  
  // Extract email addresses
  const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi;
  entities.emails = [...new Set((text.match(emailRegex) || []))];
  
  // Basic organization detection (companies ending with common suffixes)
  const orgRegex = /\b[A-Z][a-zA-Z]*(?:\s+[A-Z][a-zA-Z]*)*\s+(?:Inc|LLC|Ltd|Corp|Corporation|Company|Group|International)\b/g;
  entities.organizations = [...new Set((text.match(orgRegex) || []))];
  
  // Basic person name detection (Title + Name pattern)
  const personRegex = /\b(?:Mr|Mrs|Ms|Dr|Prof)\.?\s+[A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+){0,2}\b/g;
  entities.people = [...new Set((text.match(personRegex) || []))];
  
  return entities;
}

async function detectLanguage(text, env) {
  if (!env.AI) return 'unknown';
  
  try {
    const sample = text.substring(0, 500);
    const result = await env.AI.run('@cf/meta/m2m100-1.2b', {
      text: sample,
      task: 'language-detection'
    });
    return result.language || 'unknown';
  } catch (error) {
    console.error('Language detection failed:', error);
    return 'unknown';
  }
}

async function parseAttachments(parts) {
  const attachments = [];
  
  for (const part of parts) {
    if (part.filename) {
      attachments.push({
        filename: part.filename,
        contentType: part.contentType,
        size: part.size || 0,
        contentId: part.headers?.get('Content-ID')
      });
    }
  }
  
  return attachments;
}