import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { PreloadAllModules, provideRouter, withComponentInputBinding, withInMemoryScrolling, withNavigationErrorHandler, withPreloading } from '@angular/router';
import { routes } from './app.routes';

/** A tab opened before a new deploy asks for page files that no longer exist. */
const STALE_CHUNK = /Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module/i;

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      withComponentInputBinding(),
      // Pages are fetched in the background right after the first screen, so taps open instantly
      withPreloading(PreloadAllModules),
      // Old version after a deploy: load the new version straight at the page the user tapped
      withNavigationErrorHandler((e) => {
        if (STALE_CHUNK.test(String(e.error))) location.assign(e.url);
      }),
      withInMemoryScrolling({ anchorScrolling: 'enabled', scrollPositionRestoration: 'top' }),
    ),
  ],
};
