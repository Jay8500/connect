import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', title: 'Connect by Spread Apps · India’s own social app', loadComponent: () => import('./pages/landing').then((m) => m.Landing) },
  { path: 'login', title: 'Log in · Connect', loadComponent: () => import('./pages/auth').then((m) => m.Auth), data: { mode: 'login' } },
  { path: 'signup', title: 'Create account · Connect', loadComponent: () => import('./pages/auth').then((m) => m.Auth), data: { mode: 'signup' } },
  { path: 'privacy', title: 'Privacy policy · Connect', loadComponent: () => import('./pages/legal').then((m) => m.Legal), data: { doc: 'privacy' } },
  { path: 'terms', title: 'Terms of use · Connect', loadComponent: () => import('./pages/legal').then((m) => m.Legal), data: { doc: 'terms' } },
  { path: 'guidelines', title: 'Community guidelines · Connect', loadComponent: () => import('./pages/legal').then((m) => m.Legal), data: { doc: 'guidelines' } },
  { path: 'grievance', title: 'Grievance redressal · Connect', loadComponent: () => import('./pages/legal').then((m) => m.Legal), data: { doc: 'grievance' } },
  {
    path: '',
    loadComponent: () => import('./main/shell').then((m) => m.Shell),
    children: [
      { path: 'home', title: 'Home · Connect', loadComponent: () => import('./main/feed').then((m) => m.Feed) },
      { path: 'reels', title: 'Reels · Connect', loadComponent: () => import('./main/reels').then((m) => m.Reels) },
      { path: 'explore', title: 'Explore · Connect', loadComponent: () => import('./main/explore').then((m) => m.Explore) },
      { path: 'chats', title: 'Chats · Connect', loadComponent: () => import('./main/chats').then((m) => m.Chats) },
      { path: 'chats/:id', title: 'Chat · Connect', loadComponent: () => import('./main/chats').then((m) => m.Chats) },
      { path: 'notifications', title: 'Notifications · Connect', loadComponent: () => import('./main/notifications').then((m) => m.Notifications) },
      { path: 'friends', title: 'Friends · Connect', loadComponent: () => import('./main/friends').then((m) => m.Friends) },
      { path: 'groups', title: 'Groups · Connect', loadComponent: () => import('./main/groups').then((m) => m.Groups) },
      { path: 'create', title: 'Create post · Connect', loadComponent: () => import('./main/create').then((m) => m.Create) },
      { path: 'profile/:username', title: 'Profile · Connect', loadComponent: () => import('./main/profile').then((m) => m.Profile) },
      { path: 'settings', title: 'Settings · Connect', loadComponent: () => import('./main/settings').then((m) => m.SettingsPage) },
      { path: 'menu', title: 'Menu · Connect', loadComponent: () => import('./main/menu').then((m) => m.Menu) },
    ],
  },
  { path: '**', redirectTo: '' },
];
