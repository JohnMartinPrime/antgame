import { PostHog } from 'posthog-node';
import 'dotenv/config';

const client = new PostHog(process.env.POSTHOG_API_KEY!, {
  host: process.env.POSTHOG_HOST ?? 'https://us.i.posthog.com',
  // Flush immediately in dev so events appear in PostHog right away.
  // Remove these two lines in production to use the default batching behavior.
  flushAt: 1,
  flushInterval: 0,
});

// Flush any buffered events before Railway/Docker stops the container.
// Without this, events sitting in the buffer at shutdown are silently dropped.
process.on('SIGTERM', async () => {
  await client.shutdown();
});

export default client;
