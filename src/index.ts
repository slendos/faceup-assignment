import { serve } from '@hono/node-server';

import { app } from './routes';

const port = 3000;
console.log(`Server is running on port ${port}`);
console.log(`Swagger docs are available at http://localhost:${port}/swagger`);

serve({ fetch: app.fetch, port });
