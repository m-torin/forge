/**
 * Spam Filter Worker
 * Analyzes emails for spam characteristics and takes appropriate action
 */

export default {
  async email(message, env, ctx) {
    const config = {
      threshold: ${threshold},
      quarantineScore: ${quarantine_score},
      rejectScore: ${reject_score}
    };
    
    try {
      // Calculate spam score
      const spamScore = await calculateSpamScore(message, env);
      
      // Add spam score header
      message.headers.set('X-Spam-Score', spamScore.toString());
      message.headers.set('X-Spam-Status', getSpamStatus(spamScore, config));
      
      // Take action based on score
      if (spamScore >= config.rejectScore) {
        // Reject the email
        message.setReject('Message rejected due to high spam score');
        return;
      }
      
      if (spamScore >= config.quarantineScore) {
        // Quarantine the email
        await quarantineEmail(message, env, spamScore);
        message.setReject('Message quarantined for review');
        return;
      }
      
      if (spamScore >= config.threshold) {
        // Mark as spam but deliver
        message.headers.set('X-Spam-Flag', 'YES');
        const subject = message.headers.get('Subject') || '';
        if (!subject.startsWith('[SPAM]')) {
          message.headers.set('Subject', `[SPAM] ${subject}`);
        }
      }
      
      // Forward to original destination
      await message.forward(message.to);
      
    } catch (error) {
      console.error('Spam filter error:', error);
      // On error, forward without filtering
      await message.forward(message.to);
    }
  }
};

async function calculateSpamScore(message, env) {
  let score = 0;
  
  // Check sender reputation
  const from = message.from;
  const fromDomain = from.split('@')[1];
  
  // SPF/DKIM/DMARC checks
  const spf = message.headers.get('Received-SPF');
  const dkim = message.headers.get('DKIM-Signature');
  const dmarc = message.headers.get('Authentication-Results');
  
  if (!spf || spf.includes('fail')) score += 3;
  if (!spf || spf.includes('softfail')) score += 1;
  if (!dkim) score += 2;
  if (dmarc && dmarc.includes('fail')) score += 3;
  
  // Content analysis
  const subject = message.headers.get('Subject') || '';
  const textBody = await message.text();
  
  // Subject line checks
  const spamSubjectPatterns = [
    /\b(viagra|cialis|pharmacy|pills|medication)\b/i,
    /\b(winner|lottery|million|congratulations)\b/i,
    /\b(free|discount|offer|deal|save)\s+(now|today|money)/i,
    /\b(click here|act now|limited time|urgent)\b/i,
    /^(RE:|FW:){2,}/i, // Multiple RE: or FW:
    /[A-Z]{5,}/, // Excessive caps
    /[!$]{3,}/, // Excessive punctuation
  ];
  
  spamSubjectPatterns.forEach(pattern => {
    if (pattern.test(subject)) score += 2;
  });
  
  // Body content checks
  const spamBodyPatterns = [
    /\b(unsubscribe|remove me|opt.?out)\b/i, // Often in spam
    /https?:\/\/\S+/g, // URLs (count them)
    /\b[A-Z]{4,}\b/g, // All caps words
    /[!?]{3,}/g, // Excessive punctuation
    /\b(guarantee|risk.?free|no obligation|act now)\b/i,
  ];
  
  // Count URLs
  const urlMatches = textBody.match(/https?:\/\/\S+/g) || [];
  if (urlMatches.length > 5) score += 2;
  if (urlMatches.length > 10) score += 3;
  
  // Check for suspicious patterns
  spamBodyPatterns.forEach(pattern => {
    const matches = textBody.match(pattern) || [];
    if (matches.length > 0) score += 1;
  });
  
  // Check against known spam domains in KV
  if (env.KV_EMAIL_DATA) {
    const spamDomains = await env.KV_EMAIL_DATA.get('spam-domains', 'json') || [];
    if (spamDomains.includes(fromDomain)) score += 5;
  }
  
  // Custom rules from config
  const customRules = ${jsonencode(custom_rules)};
  for (const [rule, ruleScore] of Object.entries(customRules)) {
    if (new RegExp(rule, 'i').test(textBody) || new RegExp(rule, 'i').test(subject)) {
      score += ruleScore;
    }
  }
  
  return Math.max(0, score);
}

function getSpamStatus(score, config) {
  if (score >= config.rejectScore) return 'REJECT';
  if (score >= config.quarantineScore) return 'QUARANTINE';
  if (score >= config.threshold) return 'SPAM';
  return 'OK';
}

async function quarantineEmail(message, env, score) {
  if (!env.KV_EMAIL_QUARANTINE) return;
  
  const quarantineId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const quarantineData = {
    id: quarantineId,
    from: message.from,
    to: message.to,
    subject: message.headers.get('Subject'),
    date: new Date().toISOString(),
    score: score,
    headers: Object.fromEntries(message.headers),
    body: await message.text()
  };
  
  // Store in KV with 30-day expiration
  await env.KV_EMAIL_QUARANTINE.put(
    `quarantine:${quarantineId}`,
    JSON.stringify(quarantineData),
    { expirationTtl: 2592000 }
  );
  
  // Notify admin
  const adminEmail = message.headers.get('X-Admin-Email') || 'admin@${domain}';
  await sendQuarantineNotification(adminEmail, quarantineData, env);
}

async function sendQuarantineNotification(adminEmail, quarantineData, env) {
  // Send notification about quarantined email
  const notification = {
    from: 'security@${domain}',
    to: adminEmail,
    subject: `[QUARANTINE] Email from ${quarantineData.from}`,
    text: `An email has been quarantined.
    
From: ${quarantineData.from}
To: ${quarantineData.to}
Subject: ${quarantineData.subject}
Spam Score: ${quarantineData.score}
Date: ${quarantineData.date}
ID: ${quarantineData.id}

To review or release this email, please check the quarantine system.`
  };
  
  // Send via email API or worker
  // Implementation depends on your email sending setup
}