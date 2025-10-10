/**
 * Threat Scanner Worker
 * Scans emails for malicious content, phishing, and security threats
 */

export default {
  async email(message, env, ctx) {
    const config = {
      scanAttachments: ${scan_attachments},
      scanLinks: ${scan_links},
      phishingDetection: ${phishing_detection},
      malwareDetection: ${malware_detection},
      blockThreats: ${block_threats},
      quarantineThreats: ${quarantine_threats}
    };
    
    try {
      const messageId = message.headers.get('Message-ID') || generateMessageId();
      const from = message.from;
      const to = message.to;
      const subject = message.headers.get('Subject') || '';
      
      // Initialize threat analysis
      const threatAnalysis = {
        messageId,
        from,
        to,
        subject,
        timestamp: new Date().toISOString(),
        threats: [],
        score: 0,
        verdict: 'clean'
      };
      
      // Check sender reputation
      const senderThreat = await checkSenderReputation(from, env);
      if (senderThreat) {
        threatAnalysis.threats.push(senderThreat);
        threatAnalysis.score += senderThreat.score;
      }
      
      // Analyze email content
      const bodyText = await message.text();
      const contentThreats = await analyzeContent(bodyText, subject, config, env);
      threatAnalysis.threats.push(...contentThreats);
      threatAnalysis.score += contentThreats.reduce((sum, threat) => sum + threat.score, 0);
      
      // Scan links if enabled
      if (config.scanLinks) {
        const linkThreats = await scanLinks(bodyText, env);
        threatAnalysis.threats.push(...linkThreats);
        threatAnalysis.score += linkThreats.reduce((sum, threat) => sum + threat.score, 0);
      }
      
      // Scan attachments if enabled
      if (config.scanAttachments && message.parts) {
        const attachmentThreats = await scanAttachments(message.parts, env);
        threatAnalysis.threats.push(...attachmentThreats);
        threatAnalysis.score += attachmentThreats.reduce((sum, threat) => sum + threat.score, 0);
      }
      
      // Determine verdict based on score
      if (threatAnalysis.score >= 80) {
        threatAnalysis.verdict = 'malicious';
      } else if (threatAnalysis.score >= 50) {
        threatAnalysis.verdict = 'suspicious';
      } else if (threatAnalysis.score >= 20) {
        threatAnalysis.verdict = 'warning';
      }
      
      // Store threat analysis
      if (env.KV_EMAIL_SECURITY) {
        await env.KV_EMAIL_SECURITY.put(`threat:${messageId}`, JSON.stringify(threatAnalysis), {
          expirationTtl: 2592000 // 30 days
        });
      }
      
      // Handle threats based on verdict
      if (threatAnalysis.verdict === 'malicious' && config.blockThreats) {
        // Block the email
        await logThreatAction(threatAnalysis, 'blocked', env);
        return; // Don't forward
      }
      
      if ((threatAnalysis.verdict === 'malicious' || threatAnalysis.verdict === 'suspicious') && config.quarantineThreats) {
        // Quarantine the email
        await quarantineEmail(message, threatAnalysis, env);
        await logThreatAction(threatAnalysis, 'quarantined', env);
        return; // Don't forward
      }
      
      // Add security headers for warnings
      if (threatAnalysis.verdict === 'warning') {
        message.headers.set('X-Threat-Score', threatAnalysis.score.toString());
        message.headers.set('X-Threat-Verdict', threatAnalysis.verdict);
      }
      
      // Forward the message
      await message.forward(message.to);
      
      // Log the analysis
      await logThreatAction(threatAnalysis, 'allowed', env);
      
    } catch (error) {
      console.error('Threat scanner error:', error);
      await message.forward(message.to);
    }
  }
};

async function checkSenderReputation(from, env) {
  const domain = from.split('@')[1];
  
  // Check against known threat domains
  const threatDomains = [
    'suspicious-domain.com',
    'phishing-site.net',
    'malware-host.org'
  ];
  
  if (threatDomains.includes(domain)) {
    return {
      type: 'sender_reputation',
      description: `Sender from known malicious domain: ${domain}`,
      score: 70,
      severity: 'high'
    };
  }
  
  // Check SPF/DKIM if available
  if (env.KV_EMAIL_SECURITY) {
    const reputationData = await env.KV_EMAIL_SECURITY.get(`reputation:${domain}`, 'json');
    if (reputationData && reputationData.score > 50) {
      return {
        type: 'sender_reputation',
        description: `Sender from domain with poor reputation: ${domain}`,
        score: reputationData.score,
        severity: reputationData.score > 70 ? 'high' : 'medium'
      };
    }
  }
  
  return null;
}

async function analyzeContent(bodyText, subject, config, env) {
  const threats = [];
  
  // Check for phishing indicators
  if (config.phishingDetection) {
    const phishingIndicators = [
      /urgent.{0,20}action.{0,20}required/i,
      /verify.{0,20}account.{0,20}immediately/i,
      /suspended.{0,20}account/i,
      /click.{0,20}here.{0,20}to.{0,20}verify/i,
      /congratulations.{0,20}you.{0,20}have.{0,20}won/i,
      /limited.{0,20}time.{0,20}offer/i
    ];
    
    let phishingScore = 0;
    const foundIndicators = [];
    
    phishingIndicators.forEach(pattern => {
      if (pattern.test(bodyText) || pattern.test(subject)) {
        phishingScore += 15;
        foundIndicators.push(pattern.source);
      }
    });
    
    if (phishingScore > 0) {
      threats.push({
        type: 'phishing',
        description: `Phishing indicators detected: ${foundIndicators.length} patterns`,
        score: phishingScore,
        severity: phishingScore > 30 ? 'high' : 'medium',
        details: foundIndicators
      });
    }
  }
  
  // Check for sensitive information patterns
  const sensitivePatterns = [
    { pattern: /\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}/g, type: 'credit_card' },
    { pattern: /\d{3}[-\s]?\d{2}[-\s]?\d{4}/g, type: 'ssn' },
    { pattern: /password\s*[:=]\s*\S+/gi, type: 'password' }
  ];
  
  sensitivePatterns.forEach(({ pattern, type }) => {
    const matches = bodyText.match(pattern);
    if (matches) {
      threats.push({
        type: 'sensitive_data',
        description: `Potential ${type} detected in email content`,
        score: 25,
        severity: 'medium',
        details: { type, count: matches.length }
      });
    }
  });
  
  // Use AI for advanced content analysis if available
  if (config.malwareDetection && env.AI) {
    try {
      const aiAnalysis = await env.AI.run('@cf/meta/llama-2-7b-chat-int8', {
        messages: [
          {
            role: 'system',
            content: 'Analyze this email content for malicious intent, phishing, or spam. Respond with a JSON object containing threat_score (0-100) and threats array.'
          },
          {
            role: 'user',
            content: `Subject: ${subject}\n\nBody: ${bodyText.substring(0, 1000)}`
          }
        ]
      });
      
      if (aiAnalysis.response) {
        try {
          const aiResult = JSON.parse(aiAnalysis.response);
          if (aiResult.threat_score > 30) {
            threats.push({
              type: 'ai_analysis',
              description: 'AI detected potential malicious content',
              score: aiResult.threat_score,
              severity: aiResult.threat_score > 70 ? 'high' : 'medium',
              details: aiResult.threats
            });
          }
        } catch (e) {
          console.error('Failed to parse AI analysis:', e);
        }
      }
    } catch (error) {
      console.error('AI analysis failed:', error);
    }
  }
  
  return threats;
}

async function scanLinks(bodyText, env) {
  const threats = [];
  const urlRegex = /(https?:\/\/[^\s<>\"]+)/gi;
  const urls = bodyText.match(urlRegex) || [];
  
  for (const url of urls) {
    try {
      const domain = new URL(url).hostname;
      
      // Check against known malicious domains
      const maliciousDomains = [
        'malware-site.com',
        'phishing-domain.net',
        'suspicious-link.org'
      ];
      
      if (maliciousDomains.includes(domain)) {
        threats.push({
          type: 'malicious_link',
          description: `Malicious URL detected: ${domain}`,
          score: 60,
          severity: 'high',
          details: { url, domain }
        });
        continue;
      }
      
      // Check for suspicious patterns
      if (domain.includes('bit.ly') || domain.includes('tinyurl') || domain.includes('goo.gl')) {
        threats.push({
          type: 'suspicious_link',
          description: `Shortened URL detected: ${domain}`,
          score: 10,
          severity: 'low',
          details: { url, domain }
        });
      }
      
      // Check for URL spoofing
      if (domain.includes('paypal') && !domain.endsWith('paypal.com')) {
        threats.push({
          type: 'url_spoofing',
          description: `Potential PayPal spoofing: ${domain}`,
          score: 50,
          severity: 'high',
          details: { url, domain }
        });
      }
      
    } catch (error) {
      console.error(`Error analyzing URL ${url}:`, error);
    }
  }
  
  return threats;
}

async function scanAttachments(parts, env) {
  const threats = [];
  
  for (const part of parts) {
    if (part.filename) {
      const extension = part.filename.split('.').pop()?.toLowerCase();
      
      // Check for dangerous file extensions
      const dangerousExtensions = [
        'exe', 'bat', 'com', 'cmd', 'pif', 'scr', 'vbs', 'js', 'jar', 'ps1'
      ];
      
      if (dangerousExtensions.includes(extension)) {
        threats.push({
          type: 'dangerous_attachment',
          description: `Potentially dangerous file type: ${extension}`,
          score: 40,
          severity: 'high',
          details: { filename: part.filename, extension }
        });
      }
      
      // Check for double extensions
      if (part.filename.split('.').length > 2) {
        threats.push({
          type: 'suspicious_attachment',
          description: `File with multiple extensions: ${part.filename}`,
          score: 20,
          severity: 'medium',
          details: { filename: part.filename }
        });
      }
    }
  }
  
  return threats;
}

async function quarantineEmail(message, threatAnalysis, env) {
  if (!env.KV_EMAIL_QUARANTINE) return;
  
  const quarantineData = {
    messageId: threatAnalysis.messageId,
    from: message.from,
    to: message.to,
    subject: message.headers.get('Subject'),
    timestamp: new Date().toISOString(),
    threats: threatAnalysis.threats,
    score: threatAnalysis.score,
    verdict: threatAnalysis.verdict,
    body: await message.text()
  };
  
  await env.KV_EMAIL_QUARANTINE.put(
    `quarantine:${threatAnalysis.messageId}`,
    JSON.stringify(quarantineData),
    { expirationTtl: 2592000 } // 30 days
  );
}

async function logThreatAction(threatAnalysis, action, env) {
  if (!env.KV_EMAIL_SECURITY) return;
  
  const logEntry = {
    messageId: threatAnalysis.messageId,
    timestamp: new Date().toISOString(),
    action,
    threats: threatAnalysis.threats,
    score: threatAnalysis.score,
    verdict: threatAnalysis.verdict
  };
  
  await env.KV_EMAIL_SECURITY.put(
    `log:${threatAnalysis.messageId}`,
    JSON.stringify(logEntry),
    { expirationTtl: 2592000 }
  );
}

function generateMessageId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}