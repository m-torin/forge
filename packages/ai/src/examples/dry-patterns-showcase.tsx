/**
 * DRY Patterns Showcase
 * Before/after examples showing how the standardization eliminates repetitive code
 */

'use client';

import React from 'react';
import { ChatContainer, ChatForm, MessageList, StatusIndicator } from '../ui/react/components';
import { useChat } from '../ui/react/use-chat';

/**
 * ==========================================
 * BEFORE: The repetitive pattern from docs
 * ==========================================
 */
function ChatComponentBeforeDRY(): React.JSX.Element {
  // This is exactly what appears in every documentation example
  const chat = useChat({
    api: '/api/chat',
  });
  const { messages, status, stop, error, regenerate } = chat;
  const [input, setInput] = React.useState('');

  return (
    <div>
      {/* The repetitive messages.map() pattern */}
      {messages.map(message => (
        <div key={message.id}>
          {message.role === 'user' ? 'User: ' : 'AI: '}
          {message.parts?.map((part, index) =>
            part.type === 'text' ? <span key={index}>{part.text}</span> : null,
          )}
        </div>
      ))}

      {/* The repetitive status handling pattern */}
      {(status === 'submitted' || status === 'streaming') && (
        <div>
          {status === 'submitted' && <div>Loading...</div>}
          <button type="button" onClick={() => stop()}>
            Stop
          </button>
        </div>
      )}

      {/* The repetitive error handling pattern */}
      {error && (
        <>
          <div>An error occurred.</div>
          <button type="button" onClick={() => regenerate()}>
            Retry
          </button>
        </>
      )}

      {/* The repetitive form submission pattern */}
      <form
        onSubmit={e => {
          e.preventDefault();
          if (input.trim()) {
            // AI SDK v5: Use sendMessage method
            (chat as any).sendMessage({ text: input });
            setInput('');
          }
        }}
      >
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          disabled={status !== 'ready'}
          placeholder="Say something..."
        />
        <button type="submit" disabled={status !== 'ready'}>
          Submit
        </button>
      </form>
    </div>
  );
}

/**
 * ==========================================
 * AFTER: Using our DRY standardization
 * ==========================================
 */
function ChatComponentAfterDRY(): React.JSX.Element {
  // Same enhanced useChat hook - preserves all functionality
  const chat = useChat({
    api: '/api/chat',
  });

  // All the repetitive patterns are eliminated!
  return <ChatContainer chat={chat} />;
}

/**
 * ==========================================
 * FLEXIBLE: Mix and match components
 * ==========================================
 */
function CustomChatWithDRYComponents(): React.JSX.Element {
  const chat = useChat({
    api: '/api/chat', // Use standard API for now
  });

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '1rem' }}>
      {/* Custom header */}
      <h2>My Custom Chat</h2>

      {/* Use just the message list with custom options */}
      <MessageList
        messages={chat.messages}
        options={{
          showRole: true,
          showTimestamp: true,
          showTokenCount: true,
          className: {
            container: 'my-message',
            role: 'my-role',
          },
        }}
        emptyState={<div>Start a conversation!</div>}
      />

      {/* Custom status display */}
      <StatusIndicator
        chat={chat}
        statusMessages={{
          submitted: '🤔 Thinking...',
          streaming: '✍️ Writing...',
          error: '❌ Something went wrong!',
        }}
      />

      {/* Custom form with file support */}
      <ChatForm
        chat={chat}
        enableFiles={true}
        placeholder="Ask me anything..."
        submitText="Send"
        onBeforeSend={msg => {
          console.log('Sending:', msg);
          return true;
        }}
      />
    </div>
  );
}

/**
 * ==========================================
 * ADVANCED: Using utilities directly
 * ==========================================
 */
function AdvancedCustomRenderer(): React.JSX.Element {
  const chat = useChat();

  return (
    <div>
      {/* Use messageFormatter utilities directly for full control */}
      <div>
        {chat.messages.map((message: any) => (
          <div
            key={message.id}
            style={{ border: '1px solid #ccc', margin: '1rem 0', padding: '1rem' }}
          >
            {/* Custom role display */}
            <div style={{ fontWeight: 'bold', color: message.role === 'user' ? 'blue' : 'green' }}>
              {message.role.toUpperCase()}
            </div>

            <div style={{ marginTop: '0.5rem', fontFamily: 'monospace' }}>
              Message content:{' '}
              <span>
                {message.parts
                  ?.map((part: any) => (part.type === 'text' ? String(part.text || '') : ''))
                  .join('') || 'No content'}
              </span>
            </div>

            {/* Show metadata if available */}
            {message.metadata && (
              <div style={{ fontSize: '0.8em', color: '#666', marginTop: '0.5rem' }}>
                Created:{' '}
                {message.metadata &&
                typeof message.metadata === 'object' &&
                'createdAt' in message.metadata
                  ? new Date(String(message.metadata.createdAt)).toLocaleString()
                  : 'N/A'}
                {message.metadata &&
                  typeof message.metadata === 'object' &&
                  'totalTokens' in message.metadata &&
                  ` • ${message.metadata.totalTokens} tokens`}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Still use our DRY components for the UI */}
      <StatusIndicator chat={chat} />
      <ChatForm chat={chat} />
    </div>
  );
}

/**
 * ==========================================
 * SHOWCASE COMPONENT: Shows all variants
 * ==========================================
 */
export function DRYPatternsShowcase() {
  const [activeExample, setActiveExample] = React.useState<
    'before' | 'after' | 'custom' | 'advanced'
  >('before');

  const examples = {
    before: {
      title: 'BEFORE: Repetitive Documentation Pattern',
      description:
        'This is exactly what appears in every AI SDK documentation example - 50+ lines of repetitive code',
      component: <ChatComponentBeforeDRY />,
    },
    after: {
      title: 'AFTER: DRY Standardization',
      description:
        'Same functionality, reduced to 3 lines. All patterns standardized but AI SDK fully accessible.',
      component: <ChatComponentAfterDRY />,
    },
    custom: {
      title: 'FLEXIBLE: Mix and Match Components',
      description:
        'Use individual components with custom configuration. Full flexibility preserved.',
      component: <CustomChatWithDRYComponents />,
    },
    advanced: {
      title: 'ADVANCED: Direct Utility Usage',
      description:
        'Use formatter utilities directly for maximum control while eliminating duplication.',
      component: <AdvancedCustomRenderer />,
    },
  };

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
        <h1>@repo/ai DRY Patterns Showcase</h1>
        <p style={{ fontSize: '1.2em', color: '#666' }}>
          "Standardization without hiding" - Templates, patterns, and helpers that eliminate
          repetitive code while preserving full AI SDK access.
        </p>

        {/* Example selector */}
        <div style={{ marginBottom: '2rem' }}>
          {Object.entries(examples).map(([key, example]) => (
            <button
              key={key}
              onClick={() => setActiveExample(key as any)}
              style={{
                padding: '0.5rem 1rem',
                margin: '0 0.5rem 0.5rem 0',
                backgroundColor: activeExample === key ? '#007acc' : '#f0f0f0',
                color: activeExample === key ? 'white' : 'black',
                border: '1px solid #ccc',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              {example.title}
            </button>
          ))}
        </div>

        {/* Active example */}
        <div style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '1rem' }}>
          <h2>{examples[activeExample].title}</h2>
          <p style={{ color: '#666', marginBottom: '1rem' }}>
            {examples[activeExample].description}
          </p>

          <div
            style={{
              border: '1px solid #e0e0e0',
              borderRadius: '4px',
              padding: '1rem',
              backgroundColor: '#fafafa',
            }}
          >
            {examples[activeExample].component}
          </div>
        </div>

        {/* Benefits summary */}
        <div
          style={{
            marginTop: '2rem',
            padding: '1rem',
            backgroundColor: '#f9f9f9',
            borderRadius: '8px',
          }}
        >
          <h3>Benefits of Our DRY Approach:</h3>
          <ul>
            <li>
              <strong>Eliminates duplication:</strong> Reduces the repeated patterns from 50+ lines
              to 3 lines
            </li>
            <li>
              <strong>Preserves flexibility:</strong> All AI SDK functionality remains accessible
            </li>
            <li>
              <strong>Composable:</strong> Mix and match components as needed
            </li>
            <li>
              <strong>Type-safe:</strong> Full TypeScript support with proper inference
            </li>
            <li>
              <strong>Monorepo-optimized:</strong> Built-in telemetry, auth, and transport
              integration
            </li>
            <li>
              <strong>No vendor lock-in:</strong> Can still use raw AI SDK directly when needed
            </li>
          </ul>
        </div>

        {/* Code comparison */}
        <div style={{ marginTop: '2rem' }}>
          <h3>Code Reduction Comparison:</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <h4 style={{ color: '#d73a49' }}>❌ Before (50+ lines)</h4>
              <pre
                style={{
                  fontSize: '0.8em',
                  backgroundColor: '#fff5f5',
                  padding: '1rem',
                  borderRadius: '4px',
                  overflow: 'auto',
                }}
              >
                {`const { messages, sendMessage, status, stop, error, regenerate } = useChat();
const [input, setInput] = useState('');

return (
  <>
    {messages.map(message => (
      <div key={message.id}>
        {message.role === 'user' ? 'User: ' : 'AI: '}
        {message.parts?.map((part, index) =>
          part.type === 'text' ? <span key={index}>{part.text}</span> : null
        )}
      </div>
    ))}

    {(status === 'submitted' || status === 'streaming') && (
      <div>
        {status === 'submitted' && <div>Loading...</div>}
        <button onClick={() => stop()}>Stop</button>
      </div>
    )}

    {error && (
      <>
        <div>An error occurred.</div>
        <button onClick={() => regenerate()}>Retry</button>
      </>
    )}

    <form onSubmit={e => {
      e.preventDefault();
      if (input.trim()) {
        sendMessage({ text: input });
        setInput('');
      }
    }}>
      <input
        value={input}
        onChange={e => setInput(e.target.value)}
        disabled={status !== 'ready'}
        placeholder="Say something..."
      />
      <button type="submit" disabled={status !== 'ready'}>
        Submit
      </button>
    </form>
  </>
);`}
              </pre>
            </div>
            <div>
              <h4 style={{ color: '#28a745' }}>✅ After (3 lines)</h4>
              <pre
                style={{
                  fontSize: '0.8em',
                  backgroundColor: '#f6ffed',
                  padding: '1rem',
                  borderRadius: '4px',
                  overflow: 'auto',
                }}
              >
                {`const chat = useChat();

return <ChatContainer chat={chat} />;`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Export all examples for testing and documentation
export {
  AdvancedCustomRenderer,
  ChatComponentAfterDRY,
  ChatComponentBeforeDRY,
  CustomChatWithDRYComponents,
};
