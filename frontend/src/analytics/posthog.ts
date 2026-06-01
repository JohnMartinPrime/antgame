import posthog from 'posthog-js';

posthog.init(import.meta.env.VITE_POSTHOG_KEY as string, {
  api_host: (import.meta.env.VITE_POSTHOG_HOST as string) ?? 'https://us.i.posthog.com',
  autocapture: true,
});

export default posthog;
