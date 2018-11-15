import { IonicErrorHandler } from 'ionic-angular';  
import Raven from 'raven-js';

Raven  
    .config('https://dbf93ec1c3544aaf970f7e56c5bc6e61@sentry.io/1217709')
    .install();

export class SentryErrorHandler extends IonicErrorHandler {

    handleError(error) {
        super.handleError(error);

        try {
          Raven.captureException(error.originalError || error);
        }
        catch(e) {
          console.error(e);
        }
    }
}