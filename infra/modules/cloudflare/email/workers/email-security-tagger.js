/**
 * Email Security Tagger Worker
 * Adds security tags and classifications to emails
 */

export default {
  async email(message, env, ctx) {
    const config = {
      addSecurityHeaders: ${add_security_headers},
      tagSpam: ${tag_spam},
      tagPhishing: ${tag_phishing},
      tagMalware: ${tag_malware},
      scoreThreshold: ${score_threshold},
      useAI: ${use_ai}
    };
    
    try {
      const messageId = message.headers.get('Message-ID') || generateMessageId();
      
      // Initialize security analysis
      const securityAnalysis = {
        messageId,
        timestamp: new Date().toISOString(),
        tags: [],
        score: 0,
        classification: 'clean'
      };
      
      // Analyze email content
      const from = message.from;
      const subject = message.headers.get('Subject') || '';
      const bodyText = await message.text();
      
      // Spam detection
      if (config.tagSpam) {
        const spamAnalysis = await analyzeSpam(from, subject, bodyText, env);
        if (spamAnalysis.isSpam) {
          securityAnalysis.tags.push({
            type: 'spam',
            confidence: spamAnalysis.confidence,
            reasons: spamAnalysis.reasons
          });
          securityAnalysis.score += spamAnalysis.score;
        }
      }
      
      // Phishing detection
      if (config.tagPhishing) {
        const phishingAnalysis = await analyzePhishing(from, subject, bodyText, env);
        if (phishingAnalysis.isPhishing) {
          securityAnalysis.tags.push({
            type: 'phishing',
            confidence: phishingAnalysis.confidence,
            reasons: phishingAnalysis.reasons
          });
          securityAnalysis.score += phishingAnalysis.score;
        }
      }
      
      // Malware detection
      if (config.tagMalware) {
        const malwareAnalysis = await analyzeMalware(from, subject, bodyText, message.parts, env);
        if (malwareAnalysis.hasMalware) {
          securityAnalysis.tags.push({
            type: 'malware',
            confidence: malwareAnalysis.confidence,
            reasons: malwareAnalysis.reasons
          });
          securityAnalysis.score += malwareAnalysis.score;
        }
      }
      
      // AI-powered analysis
      if (config.useAI && env.AI) {
        const aiAnalysis = await analyzeWithAI(from, subject, bodyText, env.AI);
        if (aiAnalysis.threats.length > 0) {
          securityAnalysis.tags.push({
            type: 'ai_detected',
            confidence: aiAnalysis.confidence,
            reasons: aiAnalysis.threats
          });
          securityAnalysis.score += aiAnalysis.score;
        }
      }
      
      // Determine classification
      if (securityAnalysis.score >= config.scoreThreshold) {
        securityAnalysis.classification = 'threat';
      } else if (securityAnalysis.score >= config.scoreThreshold * 0.6) {
        securityAnalysis.classification = 'suspicious';
      } else if (securityAnalysis.score > 0) {
        securityAnalysis.classification = 'warning';
      }
      
      // Add security headers
      if (config.addSecurityHeaders) {
        message.headers.set('X-Security-Score', securityAnalysis.score.toString());
        message.headers.set('X-Security-Classification', securityAnalysis.classification);
        
        if (securityAnalysis.tags.length > 0) {
          const tagString = securityAnalysis.tags.map(tag => `${tag.type}:${tag.confidence}`).join(',');
          message.headers.set('X-Security-Tags', tagString);
        }
      }
      
      // Store analysis
      if (env.KV_EMAIL_SECURITY) {
        await env.KV_EMAIL_SECURITY.put(
          `security-tags:${messageId}`,
          JSON.stringify(securityAnalysis),
          { expirationTtl: 2592000 } // 30 days
        );
      }
      
      // Forward the message
      await message.forward(message.to);
      
    } catch (error) {
      console.error('Security tagger error:', error);
      await message.forward(message.to);
    }
  }
};

async function analyzeSpam(from, subject, bodyText, env) {
  const analysis = {
    isSpam: false,
    confidence: 0,
    score: 0,
    reasons: []
  };
  
  // Check spam indicators
  const spamIndicators = [
    { pattern: /free/gi, weight: 5, description: 'Contains "free"' },
    { pattern: /money/gi, weight: 8, description: 'Contains "money"' },
    { pattern: /urgent/gi, weight: 10, description: 'Contains "urgent"' },
    { pattern: /click here/gi, weight: 15, description: 'Contains "click here"' },
    { pattern: /congratulations/gi, weight: 12, description: 'Contains "congratulations"' },
    { pattern: /winner/gi, weight: 15, description: 'Contains "winner"' },
    { pattern: /limited time/gi, weight: 10, description: 'Contains "limited time"' },
    { pattern: /act now/gi, weight: 12, description: 'Contains "act now"' },
    { pattern: /\$\d+/g, weight: 8, description: 'Contains money amounts' },
    { pattern: /100% free/gi, weight: 20, description: 'Contains "100% free"' }
  ];
  
  const content = `${subject} ${bodyText}`;
  
  for (const indicator of spamIndicators) {
    const matches = content.match(indicator.pattern);
    if (matches) {
      analysis.score += indicator.weight * matches.length;
      analysis.reasons.push(`${indicator.description} (${matches.length} times)`);
    }
  }
  
  // Check sender reputation
  const domain = from.split('@')[1];
  if (env.KV_EMAIL_SECURITY) {
    const reputation = await env.KV_EMAIL_SECURITY.get(`reputation:${domain}`, 'json');
    if (reputation && reputation.spamScore > 50) {
      analysis.score += 25;
      analysis.reasons.push('Sender domain has poor reputation');
    }
  }
  
  // Check for excessive capitalization
  const capsRatio = (content.match(/[A-Z]/g) || []).length / content.length;
  if (capsRatio > 0.3) {
    analysis.score += 15;
    analysis.reasons.push('Excessive capitalization');
  }
  
  // Check for excessive punctuation
  const punctRatio = (content.match(/[!?]{2,}/g) || []).length;
  if (punctRatio > 0) {
    analysis.score += 10 * punctRatio;
    analysis.reasons.push('Excessive punctuation');
  }
  
  analysis.isSpam = analysis.score >= 30;
  analysis.confidence = Math.min(analysis.score / 100, 1);
  
  return analysis;
}

async function analyzePhishing(from, subject, bodyText, env) {
  const analysis = {
    isPhishing: false,
    confidence: 0,
    score: 0,
    reasons: []
  };
  
  // Check phishing indicators
  const phishingIndicators = [
    { pattern: /verify.*account/gi, weight: 25, description: 'Account verification request' },
    { pattern: /suspended.*account/gi, weight: 30, description: 'Account suspension claim' },
    { pattern: /click.*link.*verify/gi, weight: 35, description: 'Verification link request' },
    { pattern: /update.*payment/gi, weight: 25, description: 'Payment update request' },
    { pattern: /security.*alert/gi, weight: 20, description: 'Security alert' },
    { pattern: /immediate.*action/gi, weight: 20, description: 'Immediate action required' },
    { pattern: /confirm.*identity/gi, weight: 25, description: 'Identity confirmation request' },
    { pattern: /unauthorized.*access/gi, weight: 25, description: 'Unauthorized access claim' }
  ];
  
  const content = `${subject} ${bodyText}`;
  
  for (const indicator of phishingIndicators) {
    const matches = content.match(indicator.pattern);
    if (matches) {
      analysis.score += indicator.weight;
      analysis.reasons.push(indicator.description);
    }
  }
  
  // Check for suspicious domains in links
  const urlRegex = /(https?:\/\/[^\s<>\"]+)/gi;
  const urls = bodyText.match(urlRegex) || [];
  
  for (const url of urls) {
    try {
      const domain = new URL(url).hostname;
      
      // Check for typosquatting
      const legitimateDomains = ['paypal.com', 'amazon.com', 'google.com', 'microsoft.com', 'apple.com'];
      for (const legitDomain of legitimateDomains) {
        if (domain.includes(legitDomain) && domain !== legitDomain) {
          analysis.score += 40;
          analysis.reasons.push(`Suspicious domain: ${domain} (typosquatting ${legitDomain})`);
        }
      }
      
      // Check for suspicious TLDs
      const suspiciousTlds = ['.tk', '.ml', '.ga', '.cf', '.pw'];
      if (suspiciousTlds.some(tld => domain.endsWith(tld))) {
        analysis.score += 15;
        analysis.reasons.push(`Suspicious TLD: ${domain}`);
      }
      
    } catch (error) {
      // Invalid URL
      analysis.score += 10;
      analysis.reasons.push('Invalid URL detected');
    }
  }
  
  // Check sender domain vs claimed organization
  const domain = from.split('@')[1];
  const organizationClaims = [
    { pattern: /paypal/gi, legitimateDomain: 'paypal.com' },
    { pattern: /amazon/gi, legitimateDomain: 'amazon.com' },
    { pattern: /google/gi, legitimateDomain: 'google.com' },
    { pattern: /microsoft/gi, legitimateDomain: 'microsoft.com' },
    { pattern: /apple/gi, legitimateDomain: 'apple.com' }
  ];
  
  for (const claim of organizationClaims) {
    if (claim.pattern.test(content) && !domain.includes(claim.legitimateDomain)) {
      analysis.score += 35;
      analysis.reasons.push(`Claims to be from ${claim.legitimateDomain} but sent from ${domain}`);
    }
  }
  
  analysis.isPhishing = analysis.score >= 40;
  analysis.confidence = Math.min(analysis.score / 100, 1);
  
  return analysis;
}

async function analyzeMalware(from, subject, bodyText, parts, env) {
  const analysis = {
    hasMalware: false,
    confidence: 0,
    score: 0,
    reasons: []
  };
  
  // Check for malicious attachments
  if (parts) {
    for (const part of parts) {
      if (part.filename) {
        const extension = part.filename.split('.').pop()?.toLowerCase();
        
        // Dangerous file extensions
        const dangerousExtensions = [
          'exe', 'scr', 'bat', 'com', 'cmd', 'pif', 'vbs', 'js', 'jar', 'ps1'
        ];
        
        if (dangerousExtensions.includes(extension)) {
          analysis.score += 50;
          analysis.reasons.push(`Dangerous file attachment: ${part.filename}`);
        }
        
        // Check for double extensions
        if (part.filename.split('.').length > 2) {
          analysis.score += 25;
          analysis.reasons.push(`Double extension file: ${part.filename}`);
        }
      }
    }
  }
  
  // Check for malicious URLs
  const urlRegex = /(https?:\/\/[^\s<>\"]+)/gi;
  const urls = bodyText.match(urlRegex) || [];
  
  for (const url of urls) {
    try {
      const domain = new URL(url).hostname;
      
      // Check against known malware domains (would be a real database in production)
      const malwareDomains = ['malware-site.com', 'trojan-host.net', 'virus-download.org'];
      if (malwareDomains.includes(domain)) {
        analysis.score += 60;
        analysis.reasons.push(`Known malware domain: ${domain}`);
      }
      
      // Check for suspicious file downloads
      if (url.match(/\.(exe|scr|bat|com|cmd|pif|vbs|js|jar|ps1)$/i)) {
        analysis.score += 40;
        analysis.reasons.push(`Suspicious file download: ${url}`);
      }
      
    } catch (error) {
      // Invalid URL might be an obfuscation attempt
      analysis.score += 5;
      analysis.reasons.push('Malformed URL detected');
    }
  }
  
  // Check for obfuscated content
  const obfuscationIndicators = [
    { pattern: /[a-zA-Z0-9+/]{100,}/g, weight: 15, description: 'Base64-like encoding' },
    { pattern: /&#\d+;/g, weight: 10, description: 'HTML entity encoding' },
    { pattern: /%[0-9a-fA-F]{2}/g, weight: 10, description: 'URL encoding' },
    { pattern: /\\u[0-9a-fA-F]{4}/g, weight: 15, description: 'Unicode escaping' }
  ];
  
  for (const indicator of obfuscationIndicators) {
    const matches = bodyText.match(indicator.pattern);
    if (matches && matches.length > 5) {
      analysis.score += indicator.weight;
      analysis.reasons.push(`${indicator.description} (${matches.length} instances)`);
    }
  }
  
  analysis.hasMalware = analysis.score >= 30;
  analysis.confidence = Math.min(analysis.score / 100, 1);
  
  return analysis;
}

async function analyzeWithAI(from, subject, bodyText, ai) {
  const analysis = {
    threats: [],
    confidence: 0,
    score: 0
  };
  
  try {
    const prompt = `Analyze this email for security threats:
From: ${from}
Subject: ${subject}
Body: ${bodyText.substring(0, 1000)}

Respond with JSON containing:
- threat_score (0-100)
- threats (array of threat descriptions)
- confidence (0-1)`;
    
    const response = await ai.run('@cf/meta/llama-2-7b-chat-int8', {
      messages: [
        { role: 'system', content: 'You are an email security analyst. Analyze emails for spam, phishing, malware, and other threats.' },
        { role: 'user', content: prompt }
      ]
    });
    
    if (response.response) {
      const aiResult = JSON.parse(response.response);
      analysis.score = aiResult.threat_score || 0;
      analysis.threats = aiResult.threats || [];
      analysis.confidence = aiResult.confidence || 0;
    }
  } catch (error) {
    console.error('AI analysis error:', error);
  }
  
  return analysis;
}

function generateMessageId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}