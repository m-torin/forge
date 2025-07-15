/**
 * Email Quarantine Worker
 * Manages quarantined emails and provides admin interface
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    
    // Admin interface routes
    if (path.startsWith('/admin/quarantine')) {
      return await handleAdminRequest(request, env);
    }
    
    // API routes
    if (path.startsWith('/api/quarantine')) {
      return await handleApiRequest(request, env);
    }
    
    return new Response('Not Found', { status: 404 });
  },

  async email(message, env, ctx) {
    const config = {
      autoQuarantine: ${auto_quarantine},
      quarantineDays: ${quarantine_days},
      adminEmails: ${jsonencode(admin_emails)},
      notifyAdmins: ${notify_admins}
    };
    
    try {
      const messageId = message.headers.get('Message-ID') || generateMessageId();
      
      // Check if email should be quarantined
      const shouldQuarantine = await shouldQuarantineEmail(message, env);
      
      if (shouldQuarantine || config.autoQuarantine) {
        await quarantineEmail(message, messageId, shouldQuarantine.reason, env);
        
        if (config.notifyAdmins) {
          await notifyAdmins(message, messageId, shouldQuarantine.reason, config.adminEmails, env);
        }
        
        return; // Don't forward
      }
      
      // Forward if not quarantined
      await message.forward(message.to);
      
    } catch (error) {
      console.error('Quarantine worker error:', error);
      await message.forward(message.to);
    }
  }
};

async function handleAdminRequest(request, env) {
  const url = new URL(request.url);
  const path = url.pathname;
  
  // Simple authentication check
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !await verifyAdminAuth(authHeader, env)) {
    return new Response('Unauthorized', { status: 401 });
  }
  
  if (path === '/admin/quarantine') {
    return await getQuarantineDashboard(env);
  }
  
  if (path === '/admin/quarantine/list') {
    return await getQuarantineList(url.searchParams, env);
  }
  
  if (path.startsWith('/admin/quarantine/') && request.method === 'POST') {
    const messageId = path.split('/').pop();
    const action = await request.json();
    return await handleQuarantineAction(messageId, action, env);
  }
  
  return new Response('Not Found', { status: 404 });
}

async function handleApiRequest(request, env) {
  const url = new URL(request.url);
  const path = url.pathname;
  
  if (path === '/api/quarantine/stats') {
    return await getQuarantineStats(env);
  }
  
  if (path === '/api/quarantine/release' && request.method === 'POST') {
    const { messageId, adminEmail } = await request.json();
    return await releaseQuarantinedEmail(messageId, adminEmail, env);
  }
  
  if (path === '/api/quarantine/delete' && request.method === 'POST') {
    const { messageId, adminEmail } = await request.json();
    return await deleteQuarantinedEmail(messageId, adminEmail, env);
  }
  
  return new Response('Not Found', { status: 404 });
}

async function shouldQuarantineEmail(message, env) {
  // Check threat scores
  const messageId = message.headers.get('Message-ID');
  if (messageId && env.KV_EMAIL_SECURITY) {
    const threatData = await env.KV_EMAIL_SECURITY.get(`threat:${messageId}`, 'json');
    if (threatData && threatData.score > 70) {
      return { reason: 'high_threat_score', score: threatData.score };
    }
  }
  
  // Check sender reputation
  const from = message.from;
  const domain = from.split('@')[1];
  
  if (env.KV_EMAIL_SECURITY) {
    const reputationData = await env.KV_EMAIL_SECURITY.get(`reputation:${domain}`, 'json');
    if (reputationData && reputationData.quarantine) {
      return { reason: 'sender_reputation', domain };
    }
  }
  
  // Check subject patterns
  const subject = message.headers.get('Subject') || '';
  const suspiciousPatterns = [
    /\[SPAM\]/i,
    /\[PHISHING\]/i,
    /urgent.*action.*required/i,
    /verify.*account.*immediately/i
  ];
  
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(subject)) {
      return { reason: 'suspicious_subject', pattern: pattern.source };
    }
  }
  
  return false;
}

async function quarantineEmail(message, messageId, reason, env) {
  if (!env.KV_EMAIL_QUARANTINE) return;
  
  const quarantineData = {
    messageId,
    from: message.from,
    to: message.to,
    subject: message.headers.get('Subject'),
    timestamp: new Date().toISOString(),
    reason,
    headers: {},
    body: await message.text(),
    status: 'quarantined'
  };
  
  // Extract headers
  for (const [key, value] of message.headers) {
    quarantineData.headers[key.toLowerCase()] = value;
  }
  
  await env.KV_EMAIL_QUARANTINE.put(
    `quarantine:${messageId}`,
    JSON.stringify(quarantineData),
    { expirationTtl: 2592000 } // 30 days
  );
  
  // Update quarantine stats
  await updateQuarantineStats(reason, env);
}

async function notifyAdmins(message, messageId, reason, adminEmails, env) {
  const notification = {
    subject: `Email Quarantined - ${reason}`,
    text: `An email has been quarantined:

From: ${message.from}
To: ${message.to}
Subject: ${message.headers.get('Subject')}
Reason: ${reason}
Message ID: ${messageId}

Please review at: https://your-domain.com/admin/quarantine/${messageId}`,
    html: `
      <h2>Email Quarantined</h2>
      <table>
        <tr><td><strong>From:</strong></td><td>${message.from}</td></tr>
        <tr><td><strong>To:</strong></td><td>${message.to}</td></tr>
        <tr><td><strong>Subject:</strong></td><td>${message.headers.get('Subject')}</td></tr>
        <tr><td><strong>Reason:</strong></td><td>${reason}</td></tr>
        <tr><td><strong>Message ID:</strong></td><td>${messageId}</td></tr>
      </table>
      <p><a href="https://your-domain.com/admin/quarantine/${messageId}">Review Email</a></p>
    `
  };
  
  for (const adminEmail of adminEmails) {
    await sendEmail({
      from: 'quarantine@your-domain.com',
      to: adminEmail,
      ...notification
    }, env);
  }
}

async function getQuarantineDashboard(env) {
  const stats = await getQuarantineStats(env);
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Email Quarantine Dashboard</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .stats { display: flex; gap: 20px; margin-bottom: 30px; }
        .stat-card { background: #f0f0f0; padding: 20px; border-radius: 8px; }
        .quarantine-list { border-collapse: collapse; width: 100%; }
        .quarantine-list th, .quarantine-list td { 
          border: 1px solid #ddd; padding: 8px; text-align: left; 
        }
        .quarantine-list th { background-color: #f2f2f2; }
        .action-btn { 
          background: #007cba; color: white; padding: 5px 10px; 
          border: none; border-radius: 4px; cursor: pointer; 
        }
        .danger-btn { background: #dc3545; }
      </style>
    </head>
    <body>
      <h1>Email Quarantine Dashboard</h1>
      
      <div class="stats">
        <div class="stat-card">
          <h3>Total Quarantined</h3>
          <p>${stats.total}</p>
        </div>
        <div class="stat-card">
          <h3>This Week</h3>
          <p>${stats.thisWeek}</p>
        </div>
        <div class="stat-card">
          <h3>High Threat</h3>
          <p>${stats.highThreat}</p>
        </div>
      </div>
      
      <h2>Recent Quarantined Emails</h2>
      <div id="quarantine-list">
        Loading...
      </div>
      
      <script>
        async function loadQuarantineList() {
          const response = await fetch('/admin/quarantine/list');
          const emails = await response.json();
          
          const table = document.createElement('table');
          table.className = 'quarantine-list';
          
          table.innerHTML = \`
            <tr>
              <th>Timestamp</th>
              <th>From</th>
              <th>To</th>
              <th>Subject</th>
              <th>Reason</th>
              <th>Actions</th>
            </tr>
            \${emails.map(email => \`
              <tr>
                <td>\${new Date(email.timestamp).toLocaleString()}</td>
                <td>\${email.from}</td>
                <td>\${email.to}</td>
                <td>\${email.subject}</td>
                <td>\${email.reason}</td>
                <td>
                  <button class="action-btn" onclick="releaseEmail('\${email.messageId}')">Release</button>
                  <button class="action-btn danger-btn" onclick="deleteEmail('\${email.messageId}')">Delete</button>
                </td>
              </tr>
            \`).join('')}
          \`;
          
          document.getElementById('quarantine-list').replaceWith(table);
        }
        
        async function releaseEmail(messageId) {
          const response = await fetch('/api/quarantine/release', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messageId, adminEmail: 'admin@example.com' })
          });
          
          if (response.ok) {
            loadQuarantineList();
          }
        }
        
        async function deleteEmail(messageId) {
          if (confirm('Are you sure you want to delete this email?')) {
            const response = await fetch('/api/quarantine/delete', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ messageId, adminEmail: 'admin@example.com' })
            });
            
            if (response.ok) {
              loadQuarantineList();
            }
          }
        }
        
        loadQuarantineList();
      </script>
    </body>
    </html>
  `;
  
  return new Response(html, {
    headers: { 'Content-Type': 'text/html' }
  });
}

async function getQuarantineList(searchParams, env) {
  if (!env.KV_EMAIL_QUARANTINE) {
    return new Response('[]', { headers: { 'Content-Type': 'application/json' } });
  }
  
  const emails = [];
  const listResult = await env.KV_EMAIL_QUARANTINE.list({ prefix: 'quarantine:' });
  
  for (const key of listResult.keys) {
    const emailData = await env.KV_EMAIL_QUARANTINE.get(key.name, 'json');
    if (emailData) {
      emails.push({
        messageId: emailData.messageId,
        from: emailData.from,
        to: emailData.to,
        subject: emailData.subject,
        timestamp: emailData.timestamp,
        reason: emailData.reason,
        status: emailData.status
      });
    }
  }
  
  // Sort by timestamp (newest first)
  emails.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  
  return new Response(JSON.stringify(emails), {
    headers: { 'Content-Type': 'application/json' }
  });
}

async function getQuarantineStats(env) {
  const stats = { total: 0, thisWeek: 0, highThreat: 0 };
  
  if (!env.KV_EMAIL_QUARANTINE) {
    return new Response(JSON.stringify(stats), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const listResult = await env.KV_EMAIL_QUARANTINE.list({ prefix: 'quarantine:' });
  
  for (const key of listResult.keys) {
    const emailData = await env.KV_EMAIL_QUARANTINE.get(key.name, 'json');
    if (emailData) {
      stats.total++;
      
      if (new Date(emailData.timestamp) > weekAgo) {
        stats.thisWeek++;
      }
      
      if (emailData.reason === 'high_threat_score') {
        stats.highThreat++;
      }
    }
  }
  
  return new Response(JSON.stringify(stats), {
    headers: { 'Content-Type': 'application/json' }
  });
}

async function releaseQuarantinedEmail(messageId, adminEmail, env) {
  if (!env.KV_EMAIL_QUARANTINE) {
    return new Response('Quarantine not available', { status: 500 });
  }
  
  const emailData = await env.KV_EMAIL_QUARANTINE.get(`quarantine:${messageId}`, 'json');
  if (!emailData) {
    return new Response('Email not found', { status: 404 });
  }
  
  // Update status
  emailData.status = 'released';
  emailData.releasedBy = adminEmail;
  emailData.releasedAt = new Date().toISOString();
  
  await env.KV_EMAIL_QUARANTINE.put(
    `quarantine:${messageId}`,
    JSON.stringify(emailData),
    { expirationTtl: 2592000 }
  );
  
  return new Response('Email released successfully', { status: 200 });
}

async function deleteQuarantinedEmail(messageId, adminEmail, env) {
  if (!env.KV_EMAIL_QUARANTINE) {
    return new Response('Quarantine not available', { status: 500 });
  }
  
  await env.KV_EMAIL_QUARANTINE.delete(`quarantine:${messageId}`);
  
  return new Response('Email deleted successfully', { status: 200 });
}

async function updateQuarantineStats(reason, env) {
  if (!env.KV_EMAIL_QUARANTINE) return;
  
  const today = new Date().toISOString().split('T')[0];
  const statsKey = `stats:${today}`;
  
  const stats = await env.KV_EMAIL_QUARANTINE.get(statsKey, 'json') || {};
  stats[reason] = (stats[reason] || 0) + 1;
  stats.total = (stats.total || 0) + 1;
  
  await env.KV_EMAIL_QUARANTINE.put(statsKey, JSON.stringify(stats), {
    expirationTtl: 2592000
  });
}

async function verifyAdminAuth(authHeader, env) {
  // Simple authentication - in production, use proper auth
  return authHeader === 'Bearer admin-token';
}

async function sendEmail(emailData, env) {
  if (env.EMAIL_SENDER) {
    try {
      await env.EMAIL_SENDER.send(emailData);
    } catch (error) {
      console.error('Failed to send email:', error);
    }
  }
}

function generateMessageId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}