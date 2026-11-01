import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ReportSheet } from './shared/report';
import { ToastHost } from './shared/ui';

@Component({
  imports: [RouterOutlet, ToastHost, ReportSheet],
  selector: 'app-root',
  template: `<router-outlet /><app-toast-host /><app-report-sheet />`,
})
export class App {}
