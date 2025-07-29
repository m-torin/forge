/**
 * Attachment Scanner Worker
 * Scans email attachments for malware, viruses, and policy violations
 */

export default {
  async email(message, env, ctx) {
    const config = {
      scanForMalware: ${scan_for_malware},
      scanForViruses: ${scan_for_viruses},
      checkFileTypes: ${check_file_types},
      checkFileSize: ${check_file_size},
      maxFileSize: ${max_file_size},
      allowedExtensions: ${jsonencode(allowed_extensions)},
      blockedExtensions: ${jsonencode(blocked_extensions)},
      quarantineThreats: ${quarantine_threats}
    };
    
    try {
      const messageId = message.headers.get('Message-ID') || generateMessageId();
      let hasThreats = false;
      let attachmentResults = [];
      
      // Process attachments if they exist
      if (message.parts && message.parts.length > 0) {
        for (const part of message.parts) {
          if (part.filename) {
            const scanResult = await scanAttachment(part, config, env);
            attachmentResults.push(scanResult);
            
            if (scanResult.threats.length > 0) {
              hasThreats = true;
            }
          }
        }
      }
      
      // Store scan results
      if (env.KV_EMAIL_SECURITY && attachmentResults.length > 0) {
        const scanReport = {
          messageId,
          timestamp: new Date().toISOString(),
          attachments: attachmentResults,
          hasThreats,
          totalThreats: attachmentResults.reduce((sum, result) => sum + result.threats.length, 0)
        };
        
        await env.KV_EMAIL_SECURITY.put(`attachment-scan:${messageId}`, JSON.stringify(scanReport), {
          expirationTtl: 2592000 // 30 days
        });
      }
      
      // Handle threats
      if (hasThreats && config.quarantineThreats) {
        // Quarantine the entire email
        await quarantineEmailWithAttachments(message, attachmentResults, env);
        return; // Don't forward
      }
      
      // Remove dangerous attachments but forward email
      if (hasThreats) {
        await removeThreateningAttachments(message, attachmentResults);
      }
      
      // Forward the message
      await message.forward(message.to);
      
    } catch (error) {
      console.error('Attachment scanner error:', error);
      await message.forward(message.to);
    }
  }
};

async function scanAttachment(part, config, env) {
  const result = {
    filename: part.filename,
    contentType: part.contentType,
    size: part.size || 0,
    threats: [],
    verdict: 'clean'
  };
  
  const extension = part.filename.split('.').pop()?.toLowerCase();
  const mimeType = part.contentType || 'application/octet-stream';
  
  // Check file size
  if (config.checkFileSize && result.size > config.maxFileSize) {
    result.threats.push({
      type: 'file_size',
      description: `File size exceeds limit: ${formatBytes(result.size)}`,
      severity: 'medium',
      details: { size: result.size, limit: config.maxFileSize }
    });
  }
  
  // Check file extensions
  if (config.checkFileTypes) {
    // Check against blocked extensions
    if (config.blockedExtensions.includes(extension)) {
      result.threats.push({
        type: 'blocked_extension',
        description: `Blocked file type: ${extension}`,
        severity: 'high',
        details: { extension }
      });
    }
    
    // Check against allowed extensions (if whitelist is used)
    if (config.allowedExtensions.length > 0 && !config.allowedExtensions.includes(extension)) {
      result.threats.push({
        type: 'unauthorized_extension',
        description: `Unauthorized file type: ${extension}`,
        severity: 'medium',
        details: { extension }
      });
    }
    
    // Check for double extensions
    const parts = part.filename.split('.');
    if (parts.length > 2) {
      result.threats.push({
        type: 'double_extension',
        description: `Suspicious double extension: ${part.filename}`,
        severity: 'high',
        details: { extensions: parts.slice(1) }
      });
    }
  }
  
  // Check MIME type vs extension mismatch
  const expectedMimeTypes = {
    'pdf': 'application/pdf',
    'doc': 'application/msword',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'xls': 'application/vnd.ms-excel',
    'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif'
  };
  
  if (expectedMimeTypes[extension] && mimeType !== expectedMimeTypes[extension]) {
    result.threats.push({
      type: 'mime_mismatch',
      description: `MIME type mismatch: ${extension} file with ${mimeType} type`,
      severity: 'medium',
      details: { extension, mimeType, expected: expectedMimeTypes[extension] }
    });
  }
  
  // Scan file content if possible
  if (config.scanForMalware || config.scanForViruses) {
    try {
      const fileBuffer = await part.arrayBuffer();
      const contentThreats = await scanFileContent(fileBuffer, part.filename, extension, env);
      result.threats.push(...contentThreats);
    } catch (error) {
      console.error(`Failed to scan file content for ${part.filename}:`, error);
    }
  }
  
  // Determine verdict
  if (result.threats.some(t => t.severity === 'high')) {
    result.verdict = 'malicious';
  } else if (result.threats.some(t => t.severity === 'medium')) {
    result.verdict = 'suspicious';
  } else if (result.threats.length > 0) {
    result.verdict = 'warning';
  }
  
  return result;
}

async function scanFileContent(fileBuffer, filename, extension, env) {
  const threats = [];
  
  // Check for executable signatures
  const executableSignatures = [
    { signature: [0x4D, 0x5A], type: 'PE executable', severity: 'high' },
    { signature: [0x7F, 0x45, 0x4C, 0x46], type: 'ELF executable', severity: 'high' },
    { signature: [0xFE, 0xED, 0xFA, 0xCE], type: 'Mach-O executable', severity: 'high' },
    { signature: [0xCE, 0xFA, 0xED, 0xFE], type: 'Mach-O executable', severity: 'high' },
    { signature: [0x50, 0x4B, 0x03, 0x04], type: 'ZIP archive', severity: 'medium' },
    { signature: [0x52, 0x61, 0x72, 0x21], type: 'RAR archive', severity: 'medium' }
  ];
  
  const fileHeader = new Uint8Array(fileBuffer.slice(0, 32));
  
  for (const sig of executableSignatures) {
    if (matchesSignature(fileHeader, sig.signature)) {
      threats.push({
        type: 'executable_content',
        description: `File contains ${sig.type} signature`,
        severity: sig.severity,
        details: { signature: sig.type }
      });
    }
  }
  
  // Check for embedded macros in Office documents
  if (['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(extension)) {
    const macroThreats = await scanForMacros(fileBuffer, extension);
    threats.push(...macroThreats);
  }
  
  // Check for suspicious strings
  const suspiciousStrings = [
    'eval(',
    'exec(',
    'shell_exec',
    'system(',
    'passthru',
    'base64_decode',
    'document.write',
    'fromCharCode',
    'unescape(',
    'CreateObject',
    'WScript.Shell',
    'powershell',
    'cmd.exe'
  ];
  
  const fileContent = new TextDecoder('utf-8', { fatal: false }).decode(fileBuffer);
  
  for (const suspiciousString of suspiciousStrings) {
    if (fileContent.includes(suspiciousString)) {
      threats.push({
        type: 'suspicious_content',
        description: `Suspicious string found: ${suspiciousString}`,
        severity: 'medium',
        details: { string: suspiciousString }
      });
    }
  }
  
  // Use AI for advanced content analysis if available
  if (env.AI && fileBuffer.byteLength < 1048576) { // Less than 1MB
    try {
      const aiAnalysis = await analyzeFileWithAI(fileBuffer, filename, env.AI);
      if (aiAnalysis.threats.length > 0) {
        threats.push(...aiAnalysis.threats);
      }
    } catch (error) {
      console.error('AI file analysis failed:', error);
    }
  }
  
  return threats;
}

async function scanForMacros(fileBuffer, extension) {
  const threats = [];
  
  // Look for macro indicators in Office documents
  const macroIndicators = [
    'Microsoft Office Word',
    'VBA',
    'macros',
    'AutoOpen',
    'AutoExec',
    'AutoClose',
    'Auto_Open',
    'Auto_Close'
  ];
  
  const fileContent = new TextDecoder('utf-8', { fatal: false }).decode(fileBuffer);
  
  for (const indicator of macroIndicators) {
    if (fileContent.includes(indicator)) {
      threats.push({
        type: 'macro_content',
        description: `Potential macro content detected: ${indicator}`,
        severity: 'medium',
        details: { indicator }
      });
    }
  }
  
  return threats;
}

async function analyzeFileWithAI(fileBuffer, filename, ai) {
  try {
    // Convert first 1000 bytes to hex for analysis
    const hexContent = Array.from(new Uint8Array(fileBuffer.slice(0, 1000)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join(' ');
    
    const response = await ai.run('@cf/meta/llama-2-7b-chat-int8', {
      messages: [
        {
          role: 'system',
          content: 'Analyze this file hex dump for malicious content. Respond with JSON containing threat_level (0-100) and threats array.'
        },
        {
          role: 'user',
          content: `Filename: ${filename}\nHex dump: ${hexContent}`
        }
      ]
    });
    
    if (response.response) {
      const aiResult = JSON.parse(response.response);
      return {
        threats: aiResult.threats || [],
        threat_level: aiResult.threat_level || 0
      };
    }
  } catch (error) {
    console.error('AI analysis error:', error);
  }
  
  return { threats: [], threat_level: 0 };
}

function matchesSignature(fileHeader, signature) {
  if (signature.length > fileHeader.length) return false;
  
  for (let i = 0; i < signature.length; i++) {
    if (fileHeader[i] !== signature[i]) return false;
  }
  
  return true;
}

async function quarantineEmailWithAttachments(message, attachmentResults, env) {
  if (!env.KV_EMAIL_QUARANTINE) return;
  
  const messageId = message.headers.get('Message-ID') || generateMessageId();
  
  const quarantineData = {
    messageId,
    from: message.from,
    to: message.to,
    subject: message.headers.get('Subject'),
    timestamp: new Date().toISOString(),
    reason: 'malicious_attachments',
    attachments: attachmentResults,
    body: await message.text()
  };
  
  await env.KV_EMAIL_QUARANTINE.put(
    `quarantine:${messageId}`,
    JSON.stringify(quarantineData),
    { expirationTtl: 2592000 } // 30 days
  );
}

async function removeThreateningAttachments(message, attachmentResults) {
  // This would require email manipulation capabilities
  // For now, we'll just log the action
  console.log('Would remove threatening attachments:', 
    attachmentResults.filter(r => r.threats.length > 0).map(r => r.filename)
  );
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function generateMessageId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}