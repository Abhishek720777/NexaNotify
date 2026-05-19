import React from 'react';

export default function Docs() {
  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', color: 'var(--ink)' }}>
      {/* Header */}
      <div style={{ marginBottom: '3rem', borderBottom: '1px solid var(--border)', paddingBottom: '2rem' }}>
        <h1 className="page-title" style={{ margin: 0, fontSize: '2.5rem' }}>SignalFlow Documentation</h1>
        <p style={{ color: 'var(--ink-2)', fontSize: '1.1rem', marginTop: '0.5rem' }}>
          The complete developer and administrator guide to integrating, templating, and managing high-throughput multi-channel notifications.
        </p>
      </div>

      {/* Quick Navigation Sidebar / Jump-to */}
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '8px',
        padding: '1.5rem',
        marginBottom: '3rem',
        boxShadow: '0 4px 24px rgba(0,0,0,.02)'
      }}>
        <h3 style={{ fontFamily: 'JetBrains Mono', fontSize: '0.8rem', color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1rem' }}>Jump to Section</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
          <a href="#introduction" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}>1. Introduction & Core Concepts</a>
          <a href="#architecture" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}>2. System Architecture</a>
          <a href="#authentication" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}>3. Authentication & API Keys</a>
          <a href="#sending-notifications" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}>4. Sending Notifications API</a>
          <a href="#templating" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}>5. Template Engine & Versioning</a>
          <a href="#preferences" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}>6. User Preferences & Quiet Hours</a>
          <a href="#queues" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}>7. Queue Management & Retries</a>
        </div>
      </div>

      {/* Section 1: Introduction */}
      <section id="introduction" style={{ marginBottom: '4rem' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '1.25rem', borderBottom: '2px solid var(--border)', paddingBottom: '0.5rem' }}>
          1. Introduction & Core Concepts
        </h2>
        <p style={{ color: 'var(--ink-2)', lineHeight: '1.7', marginBottom: '1rem' }}>
          SignalFlow is a self-hosted, multi-channel notification engine designed for high throughput, low latency, and absolute deliverability. The engine abstracts away the complexity of handling multiple downstream service providers (like SMTP relays, SMS gateways, and Firebase Cloud Messaging) by exposing a single unified REST API.
        </p>
        <p style={{ color: 'var(--ink-2)', lineHeight: '1.7', marginBottom: '1.5rem' }}>
          Instead of writing complex routing code in your downstream applications, you send events to SignalFlow. The platform resolves templates dynamically, coordinates user preferences, executes rate limiting, and schedules deliveries with bulletproof reliability using Redis-backed queues.
        </p>
        <div style={{
          background: 'rgba(29, 184, 139, 0.08)',
          borderLeft: '4px solid var(--accent)',
          padding: '1.25rem',
          borderRadius: '0 8px 8px 0',
          marginBottom: '1.5rem'
        }}>
          <h4 style={{ color: 'var(--accent-2)', marginBottom: '0.25rem', fontWeight: 600 }}>Key Advantage</h4>
          <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--ink-2)', lineHeight: '1.6' }}>
            SignalFlow isolates application-specific business logic from notification layouts. Your backend services only need to publish raw events and parameter maps, while marketing and product team members can securely manage, test, and version notification copy through our modern, responsive dashboard.
          </p>
        </div>
      </section>

      {/* Section 2: System Architecture */}
      <section id="architecture" style={{ marginBottom: '4rem' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '1.25rem', borderBottom: '2px solid var(--border)', paddingBottom: '0.5rem' }}>
          2. System Architecture
        </h2>
        <p style={{ color: 'var(--ink-2)', lineHeight: '1.7', marginBottom: '1.5rem' }}>
          SignalFlow is built on a decoupled, asynchronous, worker-oriented model ensuring system components scale independently under load.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', background: 'var(--surface)', border: '1px solid var(--border)', padding: '1.5rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <div style={{ background: 'var(--accent-bg)', color: 'var(--accent-2)', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', flexShrink: 0 }}>1</div>
            <div>
              <strong style={{ display: 'block', marginBottom: '0.25rem' }}>API Gateway & Token Rate Limiter</strong>
              <span style={{ color: 'var(--ink-2)', fontSize: '0.9rem', lineHeight: '1.6' }}>
                Every request entering the gateway is authenticated using Client API Keys. The integrated Token Bucket algorithm dynamically checks if the client is operating within their configured rate limits (e.g., 60 requests/minute) before passing the payload down the execution pipeline.
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <div style={{ background: 'var(--accent-bg)', color: 'var(--accent-2)', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', flexShrink: 0 }}>2</div>
            <div>
              <strong style={{ display: 'block', marginBottom: '0.25rem' }}>Template Mapping & Suppression Verification</strong>
              <span style={{ color: 'var(--ink-2)', fontSize: '0.9rem', lineHeight: '1.6' }}>
                The engine matches the incoming event against active notification templates associated with the client. Before enqueuing work, the platform checks individual user preference tables. If the user has globally disabled a channel or is currently in a designated quiet hour, the event is systematically bypassed and marked as <code>SUPPRESSED</code>.
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <div style={{ background: 'var(--accent-bg)', color: 'var(--accent-2)', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', flexShrink: 0 }}>3</div>
            <div>
              <strong style={{ display: 'block', marginBottom: '0.25rem' }}>Redis Priority Job Queues</strong>
              <span style={{ color: 'var(--ink-2)', fontSize: '0.9rem', lineHeight: '1.6' }}>
                Processed payloads are converted to structured delivery jobs and immediately enqueued on Redis. The system separates high-priority events (such as One-Time Passwords) from standard transactions to prevent massive marketing campaigns from choking immediate security flows.
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <div style={{ background: 'var(--accent-bg)', color: 'var(--accent-2)', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', flexShrink: 0 }}>4</div>
            <div>
              <strong style={{ display: 'block', marginBottom: '0.25rem' }}>Multi-Channel Worker Pools</strong>
              <span style={{ color: 'var(--ink-2)', fontSize: '0.9rem', lineHeight: '1.6' }}>
                Lightweight Java-based workers continuously poll the Redis queues. They carry out the physical delivery actions against configured SMTP hosts, SMS providers, or push brokers. In the event of a downstream outage, they coordinate progressive exponential backoff retries.
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Authentication & API Keys */}
      <section id="authentication" style={{ marginBottom: '4rem' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '1.25rem', borderBottom: '2px solid var(--border)', paddingBottom: '0.5rem' }}>
          3. Authentication & API Keys
        </h2>
        <p style={{ color: 'var(--ink-2)', lineHeight: '1.7', marginBottom: '1rem' }}>
          All requests made to the SignalFlow engine API must be authenticated. The platform provides clients with secure, rotating API keys.
        </p>
        <p style={{ color: 'var(--ink-2)', lineHeight: '1.7', marginBottom: '1.5rem' }}>
          To authorize your programmatic API calls, pass your private key in the header of every HTTP request:
        </p>

        <div style={{
          background: 'var(--dark-2)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '8px',
          padding: '1rem',
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '0.875rem',
          color: '#e6edf3',
          marginBottom: '1.5rem',
          overflowX: 'auto'
        }}>
          X-API-KEY: sf_live_0b78c8d83d8e574a62df0b65f32a76f2
        </div>

        <div style={{
          background: 'rgba(229, 62, 62, 0.08)',
          borderLeft: '4px solid var(--danger)',
          padding: '1rem',
          borderRadius: '0 8px 8px 0',
          marginBottom: '1.5rem'
        }}>
          <strong style={{ color: 'var(--danger)', display: 'block', marginBottom: '0.25rem' }}>Security Guideline</strong>
          <p style={{ margin: 0, fontSize: 0.9 + 'rem', color: 'var(--ink-2)', lineHeight: '1.6' }}>
            Keep your API Keys safe. Never commit them to public version control repositories or expose them directly in clients or client-side Javascript. Route all notifications through your secure backend proxy.
          </p>
        </div>
      </section>

      {/* Section 4: Sending Notifications API */}
      <section id="sending-notifications" style={{ marginBottom: '4rem' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '1.25rem', borderBottom: '2px solid var(--border)', paddingBottom: '0.5rem' }}>
          4. Sending Notifications API
        </h2>
        <p style={{ color: 'var(--ink-2)', lineHeight: '1.7', marginBottom: '1rem' }}>
          Trigger a multi-channel template evaluation by executing a POST request to the notification pipeline endpoint.
        </p>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '1rem' }}>
          <span style={{
            background: 'var(--accent)',
            color: 'white',
            fontFamily: 'JetBrains Mono',
            fontSize: '0.75rem',
            fontWeight: 'bold',
            padding: '4px 8px',
            borderRadius: '4px'
          }}>POST</span>
          <span style={{ fontFamily: 'JetBrains Mono', fontSize: '0.9rem', color: 'var(--ink)' }}>/api/v1/notifications</span>
        </div>

        <p style={{ color: 'var(--ink-2)', fontSize: '0.95rem', marginBottom: '1rem' }}><strong>Payload JSON Structure:</strong></p>

        <pre style={{
          background: 'var(--dark-2)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '8px',
          padding: '1.25rem',
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '0.85rem',
          color: '#e6edf3',
          marginBottom: '1.5rem',
          overflowX: 'auto'
        }}>{`{
  "userId": "user_9831a2",
  "event": "ORDER_CONFIRMATION",
  "priority": "HIGH",
  "data": {
    "name": "Jane Miller",
    "orderId": "ORD-7762391",
    "total": "$149.50",
    "items": "High-fidelity Audio Headset"
  }
}`}</pre>

        <p style={{ color: 'var(--ink-2)', lineHeight: '1.7', marginBottom: '1.5rem' }}>
          When SignalFlow processes this request, it maps <code>ORDER_CONFIRMATION</code> to your active templates. If you have an active Email template and an active SMS template for this event, the user will receive both notifications simultaneously, populated with the payload variables from the <code>data</code> block.
        </p>
      </section>

      {/* Section 5: Template Engine & Versioning */}
      <section id="templating" style={{ marginBottom: '4rem' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '1.25rem', borderBottom: '2px solid var(--border)', paddingBottom: '0.5rem' }}>
          5. Template Engine & Versioning
        </h2>
        <p style={{ color: 'var(--ink-2)', lineHeight: '1.7', marginBottom: '1rem' }}>
          SignalFlow templates utilize <strong>Apache FreeMarker</strong> logic to resolve raw text or HTML documents. FreeMarker supports placeholders, conditional structures, loops, and custom logic blocks.
        </p>

        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginTop: '1.5rem', marginBottom: '0.75rem' }}>Dynamic Brand Injection</h3>
        <p style={{ color: 'var(--ink-2)', lineHeight: '1.7', marginBottom: '1rem' }}>
          Every template automatically receives standard system brand overrides. These allow you to establish global layout defaults but override them on a template-specific or client-specific basis:
        </p>

        <table style={{ width: '100%', marginBottom: '1.5rem', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg)' }}>
              <th style={{ padding: '8px 12px', fontSize: '0.75rem', fontFamily: 'JetBrains Mono', color: 'var(--ink-3)' }}>Variable</th>
              <th style={{ padding: '8px 12px', fontSize: '0.75rem', fontFamily: 'JetBrains Mono', color: 'var(--ink-3)' }}>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <td style={{ padding: '8px 12px', fontFamily: 'JetBrains Mono', fontSize: '0.85rem' }}>{`\${brandLogo}`}</td>
              <td style={{ padding: '8px 12px', fontSize: '0.875rem', color: 'var(--ink-2)' }}>The global or template-specific client branding logo URL.</td>
            </tr>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <td style={{ padding: '8px 12px', fontFamily: 'JetBrains Mono', fontSize: '0.85rem' }}>{`\${brandColor}`}</td>
              <td style={{ padding: '8px 12px', fontSize: '0.875rem', color: 'var(--ink-2)' }}>Client Primary Theme hex color (e.g. <code>#6366f1</code>).</td>
            </tr>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <td style={{ padding: '8px 12px', fontFamily: 'JetBrains Mono', fontSize: '0.85rem' }}>{`\${clientName}`}</td>
              <td style={{ padding: '8px 12px', fontSize: '0.875rem', color: 'var(--ink-2)' }}>The client business name printed dynamically in layout headers/footers.</td>
            </tr>
          </tbody>
        </table>

        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginTop: '2rem', marginBottom: '0.75rem' }}>Template Version Control</h3>
        <p style={{ color: 'var(--ink-2)', lineHeight: '1.7', marginBottom: '1.5rem' }}>
          SignalFlow features non-destructive template versioning. Whenever you modify a template:
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '1.25rem' }}>
            <h4 style={{ fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.95rem' }}>Version Increments</h4>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--ink-2)', lineHeight: '1.6' }}>
              The existing active version (e.g. <code>v2</code>) is immediately flagged as inactive (<code>active=false</code>). The database generates a brand new clone with <code>version=3</code> and the new edits.
            </p>
          </div>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '1.25rem' }}>
            <h4 style={{ fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.95rem' }}>Zero-Downtime Rollbacks</h4>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--ink-2)', lineHeight: '1.6' }}>
              Because older configurations are archived rather than overwritten, administrators can instantly review older code configurations and verify version lineage directly.
            </p>
          </div>
        </div>
      </section>

      {/* Section 6: User Preferences & Quiet Hours */}
      <section id="preferences" style={{ marginBottom: '4rem' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '1.25rem', borderBottom: '2px solid var(--border)', paddingBottom: '0.5rem' }}>
          6. User Preferences & Quiet Hours
        </h2>
        <p style={{ color: 'var(--ink-2)', lineHeight: '1.7', marginBottom: '1.5rem' }}>
          In addition to system-wide filters, SignalFlow values the preferences of end-users. The platform maintains structured settings per user:
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', background: 'var(--surface)', border: '1px solid var(--border)', padding: '1.5rem', borderRadius: '8px' }}>
          <div>
            <strong style={{ display: 'block', marginBottom: '0.25rem' }}>Global & Channel-Specific Opt-Outs</strong>
            <span style={{ color: 'var(--ink-2)', fontSize: '0.9rem', lineHeight: '1.6' }}>
              Users can selectively disable communication channels. If a user turns off standard SMS alerts, SignalFlow intercepts and blocks outbound SMS requests immediately, while allowing standard Email or push channels to deliver uninterrupted.
            </span>
          </div>
          <hr style={{ border: 'none', borderTop: '1px solid var(--border)' }} />
          <div>
            <strong style={{ display: 'block', marginBottom: '0.25rem' }}>Smart Quiet Hours</strong>
            <span style={{ color: 'var(--ink-2)', fontSize: '0.9rem', lineHeight: '1.6' }}>
              Quiet hours limit standard notification delivery during sleeping windows (e.g. 10:00 PM to 7:00 AM). If a low-priority notification is dispatched during quiet hours, it is automatically suppressed. High-priority events (such as security OTPs) ignore quiet hours to ensure safety.
            </span>
          </div>
        </div>
      </section>

      {/* Section 7: Queue Management & Retries */}
      <section id="queues" style={{ marginBottom: '4rem', paddingBottom: '4rem' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '1.25rem', borderBottom: '2px solid var(--border)', paddingBottom: '0.5rem' }}>
          7. Queue Management & Retries
        </h2>
        <p style={{ color: 'var(--ink-2)', lineHeight: '1.7', marginBottom: '1rem' }}>
          Outbound messages are scheduled through Redis. The engine leverages dual queue lists: <code>queue:high</code> and <code>queue:low</code>. Workers pull tasks from the high-priority list first, ensuring fast delivery of critical actions.
        </p>

        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginTop: '1.5rem', marginBottom: '0.75rem' }}>Exponential Backoff Retries</h3>
        <p style={{ color: 'var(--ink-2)', lineHeight: '1.7', marginBottom: '1rem' }}>
          If a third-party gateway responds with a temporary error (network timeout, API throttled, etc.), the worker calculates a delayed schedule timestamp using exponential backoff:
        </p>

        <div style={{
          background: 'var(--dark-2)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '8px',
          padding: '1rem',
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '0.875rem',
          color: '#e6edf3',
          marginBottom: '1.5rem',
          overflowX: 'auto'
        }}>
          Delay = 2 ^ (Attempt Count) Seconds
        </div>

        <p style={{ color: 'var(--ink-2)', lineHeight: '1.7' }}>
          The job is temporarily parked in the Redis sorted set (zset) <code>queue:delayed</code>. A separate scheduler task continuously polls the delayed queue every second, transferring expired jobs back into primary active queue lists. Jobs will fail and move to <code>DEAD</code> status after exactly 5 unsuccessful attempts.
        </p>
      </section>
    </div>
  );
}
