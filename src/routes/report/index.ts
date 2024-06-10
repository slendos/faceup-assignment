import { OpenAPIHono } from '@hono/zod-openapi';

import { createReportRoute } from './create';
import { deleteReportRoute } from './delete';
import { getReportRoute } from './get';
import { patchReportRoute } from './patch';

const reportRoute = new OpenAPIHono();

reportRoute.route('', createReportRoute);
reportRoute.route('', deleteReportRoute);
reportRoute.route('', getReportRoute);
reportRoute.route('', patchReportRoute);

export { reportRoute };
