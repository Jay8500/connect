import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { PreloadAllModules, provideRouter, withComponentInputBinding, withInMemoryScrolling, withPreloading } from '@angular/router';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    // Pages are fetched in the background right after the first screen, so taps open instantly
    provideRouter(routes, withComponentInputBinding(), withPreloading(PreloadAllModules), withInMemoryScrolling({ anchorScrolling: 'enabled', scrollPositionRestoration: 'top' })),
  ],
};
