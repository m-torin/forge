/**
 * Auto Responder Worker
 * Sends automated responses based on configured rules
 */

export default {
  async email(message, env, ctx) {
    const config = {
      defaultMessage: `${default_message}`,
      businessHours: ${business_hours},
      excludeDomains: ${jsonencode(exclude_domains)},
      rateLimit: '${rate_limit}'
    };
    
    try {
      const from = message.from;
      const fromDomain = from.split('@')[1];
      
      // Skip auto-reply for excluded domains
      if (config.excludeDomains.some(domain => fromDomain.includes(domain))) {
        await message.forward(message.to);
        return;
      }
      
      // Check rate limit
      if (env.KV_EMAIL_DATA) {
        const rateLimitKey = `autoresponder:${from}`;
        const lastReply = await env.KV_EMAIL_DATA.get(rateLimitKey);
        
        if (lastReply) {
          const timeSinceLastReply = Date.now() - parseInt(lastReply);
          const rateLimitMs = parseRateLimit(config.rateLimit);
          
          if (timeSinceLastReply < rateLimitMs) {
            // Skip auto-reply due to rate limit
            await message.forward(message.to);
            return;
          }
        }
        
        // Update rate limit timestamp
        await env.KV_EMAIL_DATA.put(rateLimitKey, Date.now().toString(), {
          expirationTtl: 86400 // 24 hours
        });
      }
      
      // Check business hours if enabled
      if (config.businessHours && !isBusinessHours()) {
        // Send out-of-office response
        await sendAutoReply(message, getOutOfOfficeMessage(), env);
      } else {
        // Send standard auto-reply
        const replyMessage = await getReplyMessage(message, env);
        await sendAutoReply(message, replyMessage, env);
      }
      
      // Forward original message
      await message.forward(message.to);
      
    } catch (error) {
      console.error('Auto-responder error:', error);
      // On error, just forward without auto-reply
      await message.forward(message.to);
    }
  }
};

async function getReplyMessage(message, env) {
  const subject = message.headers.get('Subject') || '';
  const from = message.from;
  
  // Check for custom templates based on subject or sender
  if (env.KV_EMAIL_TEMPLATES) {
    // Check for subject-based templates
    const subjectTemplates = await env.KV_EMAIL_TEMPLATES.list({ prefix: 'autoresponder:subject:' });
    for (const key of subjectTemplates.keys) {
      const pattern = key.name.replace('autoresponder:subject:', '');
      if (new RegExp(pattern, 'i').test(subject)) {
        const template = await env.KV_EMAIL_TEMPLATES.get(key.name, 'json');
        return personalizeMessage(template.message, { from, subject });
      }
    }
    
    // Check for domain-based templates
    const fromDomain = from.split('@')[1];
    const domainTemplate = await env.KV_EMAIL_TEMPLATES.get(`autoresponder:domain:${fromDomain}`, 'json');
    if (domainTemplate) {
      return personalizeMessage(domainTemplate.message, { from, subject });
    }
  }
  
  // Return default message
  return personalizeMessage('${default_message}', { from, subject });
}

function personalizeMessage(template, variables) {
  let message = template;
  
  // Replace variables
  message = message.replace(/\{from\}/g, variables.from);
  message = message.replace(/\{subject\}/g, variables.subject);
  message = message.replace(/\{date\}/g, new Date().toLocaleDateString());
  message = message.replace(/\{time\}/g, new Date().toLocaleTimeString());
  
  return message;
}

async function sendAutoReply(originalMessage, replyText, env) {
  const replyEmail = {
    from: originalMessage.to,
    to: originalMessage.from,
    subject: `Re: ${originalMessage.headers.get('Subject') || 'Your message'}`,
    headers: {
      'In-Reply-To': originalMessage.headers.get('Message-ID'),
      'References': originalMessage.headers.get('Message-ID'),
      'X-Auto-Response': 'true'
    },
    text: replyText,
    html: `<div style="font-family: Arial, sans-serif;">
      <p>${replyText.replace(/\n/g, '<br>')}</p>
      <hr style="margin: 20px 0; border: 1px solid #eee;">
      <p style="color: #666; font-size: 12px;">
        This is an automated response. Your original message has been received and forwarded to the appropriate recipient.
      </p>
    </div>`
  };
  
  // Send the auto-reply
  // Implementation depends on your email sending service
  // For example, using a worker binding or API
  if (env.EMAIL_SENDER) {
    await env.EMAIL_SENDER.send(replyEmail);
  }
}

function isBusinessHours() {
  const now = new Date();
  const day = now.getDay();
  const hour = now.getHours();
  
  // Monday-Friday (1-5), 9 AM - 5 PM
  if (day >= 1 && day <= 5 && hour >= 9 && hour < 17) {
    return true;
  }
  
  return false;
}

function getOutOfOfficeMessage() {
  return `Thank you for your email. 

I am currently out of the office and will respond to your message during business hours (Monday-Friday, 9 AM - 5 PM).

If this is urgent, please contact our support team at support@${domain}.

Best regards`;
}

function parseRateLimit(rateLimit) {
  const match = rateLimit.match(/^(\d+)([mhd])$/);
  if (!match) return 3600000; // Default 1 hour
  
  const value = parseInt(match[1]);
  const unit = match[2];
  
  switch (unit) {
    case 'm': return value * 60 * 1000; // minutes
    case 'h': return value * 60 * 60 * 1000; // hours
    case 'd': return value * 24 * 60 * 60 * 1000; // days
    default: return 3600000;
  }
}