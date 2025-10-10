/**
 * Email List Processor Worker
 * Handles mailing list subscriptions, unsubscriptions, and distribution
 */

export default {
  async email(message, env, ctx) {
    const config = {
      enableSubscriptions: ${enable_subscriptions},
      enableUnsubscriptions: ${enable_unsubscriptions},
      enableDistribution: ${enable_distribution},
      requireConfirmation: ${require_confirmation},
      maxSubscribers: ${max_subscribers}
    };
    
    try {
      const from = message.from;
      const to = message.to;
      const subject = message.headers.get('Subject') || '';
      const bodyText = await message.text();
      
      // Check if this is a list command
      if (subject.toLowerCase().includes('subscribe') || bodyText.toLowerCase().includes('subscribe')) {
        if (config.enableSubscriptions) {
          await handleSubscription(from, to, message, config, env);
        }
        return;
      }
      
      if (subject.toLowerCase().includes('unsubscribe') || bodyText.toLowerCase().includes('unsubscribe')) {
        if (config.enableUnsubscriptions) {
          await handleUnsubscription(from, to, message, env);
        }
        return;
      }
      
      // Check if this is a distribution email
      if (config.enableDistribution && await isDistributionList(to, env)) {
        await handleDistribution(message, to, env);
        return;
      }
      
      // Regular email processing
      await message.forward(message.to);
      
    } catch (error) {
      console.error('Email list processor error:', error);
      await message.forward(message.to);
    }
  }
};

async function handleSubscription(email, listAddress, message, config, env) {
  const listName = listAddress.split('@')[0];
  
  // Check if already subscribed
  if (env.KV_EMAIL_LISTS) {
    const subscriberKey = `subscriber:${listName}:${email}`;
    const existing = await env.KV_EMAIL_LISTS.get(subscriberKey);
    
    if (existing) {
      await sendResponse(email, 'Already Subscribed', 
        `You are already subscribed to ${listName}.`, env);
      return;
    }
    
    // Check subscriber count
    const subscriberCount = await getSubscriberCount(listName, env);
    if (subscriberCount >= config.maxSubscribers) {
      await sendResponse(email, 'Subscription Limit Reached', 
        `The mailing list ${listName} has reached its maximum capacity.`, env);
      return;
    }
  }
  
  if (config.requireConfirmation) {
    await sendConfirmationEmail(email, listName, env);
  } else {
    await confirmSubscription(email, listName, env);
  }
}

async function handleUnsubscription(email, listAddress, message, env) {
  const listName = listAddress.split('@')[0];
  
  if (env.KV_EMAIL_LISTS) {
    const subscriberKey = `subscriber:${listName}:${email}`;
    await env.KV_EMAIL_LISTS.delete(subscriberKey);
    
    // Update subscriber count
    const countKey = `count:${listName}`;
    const currentCount = parseInt(await env.KV_EMAIL_LISTS.get(countKey) || '0');
    await env.KV_EMAIL_LISTS.put(countKey, Math.max(0, currentCount - 1).toString());
    
    await sendResponse(email, 'Unsubscribed', 
      `You have been unsubscribed from ${listName}.`, env);
  }
}

async function handleDistribution(message, listAddress, env) {
  const listName = listAddress.split('@')[0];
  
  if (!env.KV_EMAIL_LISTS) {
    await message.forward(message.to);
    return;
  }
  
  // Get all subscribers
  const subscribers = await getSubscribers(listName, env);
  
  if (subscribers.length === 0) {
    console.log(`No subscribers found for list: ${listName}`);
    return;
  }
  
  // Forward to all subscribers
  for (const subscriber of subscribers) {
    try {
      await message.forward(subscriber);
    } catch (error) {
      console.error(`Failed to forward to ${subscriber}:`, error);
    }
  }
  
  // Log distribution
  const logEntry = {
    listName,
    timestamp: new Date().toISOString(),
    from: message.from,
    subject: message.headers.get('Subject'),
    recipientCount: subscribers.length
  };
  
  await env.KV_EMAIL_LISTS.put(
    `log:${listName}:${Date.now()}`,
    JSON.stringify(logEntry),
    { expirationTtl: 2592000 } // 30 days
  );
}

async function sendConfirmationEmail(email, listName, env) {
  const confirmationToken = generateToken();
  const confirmationUrl = `https://your-domain.com/confirm?token=${confirmationToken}&email=${encodeURIComponent(email)}&list=${listName}`;
  
  // Store pending confirmation
  if (env.KV_EMAIL_LISTS) {
    await env.KV_EMAIL_LISTS.put(
      `pending:${confirmationToken}`,
      JSON.stringify({ email, listName, timestamp: new Date().toISOString() }),
      { expirationTtl: 86400 } // 24 hours
    );
  }
  
  const confirmationEmail = {
    from: `noreply@${listName}`,
    to: email,
    subject: `Confirm subscription to ${listName}`,
    text: `Please confirm your subscription to ${listName} by clicking the link below:\n\n${confirmationUrl}\n\nThis link will expire in 24 hours.`,
    html: `
      <h2>Confirm your subscription</h2>
      <p>Please confirm your subscription to <strong>${listName}</strong> by clicking the button below:</p>
      <p><a href="${confirmationUrl}" style="background-color: #007cba; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Confirm Subscription</a></p>
      <p>This link will expire in 24 hours.</p>
    `
  };
  
  await sendEmail(confirmationEmail, env);
}

async function confirmSubscription(email, listName, env) {
  if (env.KV_EMAIL_LISTS) {
    const subscriberKey = `subscriber:${listName}:${email}`;
    const subscriptionData = {
      email,
      listName,
      subscribedAt: new Date().toISOString(),
      confirmed: true
    };
    
    await env.KV_EMAIL_LISTS.put(subscriberKey, JSON.stringify(subscriptionData));
    
    // Update subscriber count
    const countKey = `count:${listName}`;
    const currentCount = parseInt(await env.KV_EMAIL_LISTS.get(countKey) || '0');
    await env.KV_EMAIL_LISTS.put(countKey, (currentCount + 1).toString());
  }
  
  await sendResponse(email, 'Subscription Confirmed', 
    `Your subscription to ${listName} has been confirmed.`, env);
}

async function isDistributionList(email, env) {
  if (!env.KV_EMAIL_LISTS) return false;
  
  const listName = email.split('@')[0];
  const listConfig = await env.KV_EMAIL_LISTS.get(`config:${listName}`, 'json');
  
  return listConfig && listConfig.isDistributionList === true;
}

async function getSubscribers(listName, env) {
  if (!env.KV_EMAIL_LISTS) return [];
  
  const subscribers = [];
  const listResult = await env.KV_EMAIL_LISTS.list({ prefix: `subscriber:${listName}:` });
  
  for (const key of listResult.keys) {
    const subscriberData = await env.KV_EMAIL_LISTS.get(key.name, 'json');
    if (subscriberData && subscriberData.confirmed) {
      subscribers.push(subscriberData.email);
    }
  }
  
  return subscribers;
}

async function getSubscriberCount(listName, env) {
  if (!env.KV_EMAIL_LISTS) return 0;
  
  const count = await env.KV_EMAIL_LISTS.get(`count:${listName}`);
  return parseInt(count || '0');
}

async function sendResponse(to, subject, text, env) {
  const responseEmail = {
    from: 'noreply@lists.example.com',
    to,
    subject,
    text,
    html: `<div style="font-family: Arial, sans-serif;"><p>${text}</p></div>`
  };
  
  await sendEmail(responseEmail, env);
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

function generateToken() {
  return Math.random().toString(36).substr(2, 15) + Math.random().toString(36).substr(2, 15);
}