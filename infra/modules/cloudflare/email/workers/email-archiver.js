/**
 * Email Archiver Worker
 * Archives emails to long-term storage with indexing
 */

export default {
  async email(message, env, ctx) {
    const config = {
      archiveAttachments: ${archive_attachments},
      compressEmails: ${compress_emails},
      retentionDays: ${retention_days},
      indexContent: ${index_content}
    };
    
    try {
      const messageId = message.headers.get('Message-ID') || generateMessageId();
      const timestamp = new Date().toISOString();
      
      // Build email archive object
      const emailData = {
        messageId,
        from: message.from,
        to: message.to,
        subject: message.headers.get('Subject'),
        timestamp,
        headers: {},
        content: {}
      };
      
      // Extract headers
      for (const [key, value] of message.headers) {
        emailData.headers[key.toLowerCase()] = value;
      }
      
      // Extract content
      const bodyText = await message.text();
      emailData.content.text = bodyText;
      
      // Parse HTML if available
      const bodyHtml = await message.html?.();
      if (bodyHtml) {
        emailData.content.html = bodyHtml;
      }
      
      // Process attachments
      if (config.archiveAttachments && message.parts) {
        emailData.attachments = await archiveAttachments(message.parts, messageId, env);
      }
      
      // Compress if enabled
      let archivedData = JSON.stringify(emailData);
      if (config.compressEmails) {
        archivedData = await compressData(archivedData);
        emailData.compressed = true;
      }
      
      // Store in R2 with date-based structure
      if (env.R2_EMAIL_ARCHIVE) {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        
        const archiveKey = `emails/${year}/${month}/${day}/${messageId}.json`;
        
        await env.R2_EMAIL_ARCHIVE.put(archiveKey, archivedData, {
          httpMetadata: {
            contentType: 'application/json',
            contentEncoding: config.compressEmails ? 'gzip' : undefined
          },
          customMetadata: {
            from: message.from,
            to: message.to,
            subject: message.headers.get('Subject')?.substring(0, 100) || '',
            timestamp,
            messageId
          }
        });
      }
      
      // Index for searching if enabled
      if (config.indexContent && env.KV_EMAIL_INDEX) {
        await indexEmail(emailData, env);
      }
      
      // Store metadata for quick access
      if (env.KV_EMAIL_DATA) {
        const metadata = {
          messageId,
          from: message.from,
          to: message.to,
          subject: message.headers.get('Subject'),
          timestamp,
          archived: true,
          compressed: config.compressEmails,
          size: archivedData.length,
          attachmentCount: emailData.attachments?.length || 0
        };
        
        await env.KV_EMAIL_DATA.put(`meta:${messageId}`, JSON.stringify(metadata), {
          expirationTtl: config.retentionDays * 24 * 60 * 60
        });
      }
      
      // Set up retention cleanup
      if (config.retentionDays > 0) {
        ctx.waitUntil(scheduleCleanup(messageId, config.retentionDays, env));
      }
      
      // Forward original message
      await message.forward(message.to);
      
    } catch (error) {
      console.error('Email archiver error:', error);
      await message.forward(message.to);
    }
  }
};

async function archiveAttachments(parts, messageId, env) {
  const attachments = [];
  
  for (const part of parts) {
    if (part.filename) {
      try {
        const attachmentData = await part.arrayBuffer();
        const attachmentKey = `attachments/${messageId}/${part.filename}`;
        
        if (env.R2_EMAIL_ARCHIVE) {
          await env.R2_EMAIL_ARCHIVE.put(attachmentKey, attachmentData, {
            httpMetadata: {
              contentType: part.contentType
            },
            customMetadata: {
              messageId,
              filename: part.filename,
              size: attachmentData.byteLength.toString()
            }
          });
        }
        
        attachments.push({
          filename: part.filename,
          contentType: part.contentType,
          size: attachmentData.byteLength,
          key: attachmentKey
        });
      } catch (error) {
        console.error(`Failed to archive attachment ${part.filename}:`, error);
      }
    }
  }
  
  return attachments;
}

async function compressData(data) {
  // Simple compression using gzip
  const encoder = new TextEncoder();
  const inputBuffer = encoder.encode(data);
  
  const compressionStream = new CompressionStream('gzip');
  const writer = compressionStream.writable.getWriter();
  const reader = compressionStream.readable.getReader();
  
  writer.write(inputBuffer);
  writer.close();
  
  const chunks = [];
  let done = false;
  
  while (!done) {
    const { value, done: readerDone } = await reader.read();
    done = readerDone;
    if (value) {
      chunks.push(value);
    }
  }
  
  // Combine chunks
  const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }
  
  return result;
}

async function indexEmail(emailData, env) {
  const searchTerms = [];
  
  // Index from, to, subject
  searchTerms.push(emailData.from);
  searchTerms.push(emailData.to);
  if (emailData.subject) {
    searchTerms.push(emailData.subject);
  }
  
  // Index content words
  const contentWords = emailData.content.text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2);
  
  searchTerms.push(...contentWords);
  
  // Create index entries
  const indexPromises = [];
  
  for (const term of [...new Set(searchTerms)]) {
    const indexKey = `index:${term}`;
    
    // Get existing entries
    const existingEntries = await env.KV_EMAIL_INDEX.get(indexKey, 'json') || [];
    
    // Add new entry
    const newEntry = {
      messageId: emailData.messageId,
      timestamp: emailData.timestamp,
      from: emailData.from,
      to: emailData.to,
      subject: emailData.subject
    };
    
    existingEntries.push(newEntry);
    
    // Keep only the most recent 100 entries per term
    if (existingEntries.length > 100) {
      existingEntries.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      existingEntries.splice(100);
    }
    
    indexPromises.push(
      env.KV_EMAIL_INDEX.put(indexKey, JSON.stringify(existingEntries), {
        expirationTtl: 2592000 // 30 days
      })
    );
  }
  
  await Promise.all(indexPromises);
}

async function scheduleCleanup(messageId, retentionDays, env) {
  // Schedule cleanup using QStash if available
  if (env.QSTASH_TOKEN) {
    const cleanupTime = new Date(Date.now() + retentionDays * 24 * 60 * 60 * 1000);
    
    try {
      await fetch('https://qstash.upstash.io/v1/publish', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.QSTASH_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          url: `${env.WORKER_URL}/cleanup`,
          body: JSON.stringify({ messageId, type: 'email_cleanup' }),
          notBefore: Math.floor(cleanupTime.getTime() / 1000)
        })
      });
    } catch (error) {
      console.error('Failed to schedule cleanup:', error);
    }
  }
}

function generateMessageId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}