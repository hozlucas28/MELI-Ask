import * as Sentry from "@sentry/node"
import { SENTRY_DSN, SENTRY_ENVIRONMENT } from "#src/env"

if (SENTRY_DSN) {
    Sentry.init({
        dsn: SENTRY_DSN,
        environment: SENTRY_ENVIRONMENT,
        sendDefaultPii: false,
        tracesSampleRate: 1,
        beforeSend(event) {
            delete event.request

            return event
        }
    })
}
