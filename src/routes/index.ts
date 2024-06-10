import { swaggerUI } from '@hono/swagger-ui';
import { OpenAPIHono } from '@hono/zod-openapi';

import { fileRoute } from './file';
import { reportRoute } from './report';
import { reportsRoute } from './reports';

const app = new OpenAPIHono();

app.route('reports', reportsRoute);
app.route('report', reportRoute);
app.route('file', fileRoute);

app.doc('/docs', {
  openapi: '3.0.3',
  info: { version: '1.0.0', title: 'Faceup task API' },
});

app.get('/swagger', swaggerUI({ url: '/docs' }));

export { app };
