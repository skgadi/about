import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { name: 'index', path: '', component: () => import('pages/IndexPage.vue') },
      {
        name: 'about',
        path: 'about',
        component: () => import('pages/AboutPage.vue'),
      },
      {
        name: 'sign-in',
        path: 'sign-in',
        component: () => import('pages/SignInPage.vue'),
      },
      {
        name: 'sign-up',
        path: 'sign-up',
        component: () => import('pages/SignUpPage.vue'),
      },
      {
        name: 'sign-out',
        path: 'sign-out',
        component: () => import('pages/SignOutPage.vue'),
      },
      {
        name: 'forgot-password',
        path: 'forgot-password',
        component: () => import('pages/ForgotPasswordPage.vue'),
      },
      {
        name: 'reset-password',
        path: 'reset-password',
        component: () => import('pages/ResetPasswordPage.vue'),
      },
      {
        name: 'my-profile',
        path: 'my-profile',
        component: () => import('pages/Profile/MyProfilePage.vue'),
      },
      {
        name: 'my-settings',
        path: 'my-settings',
        component: () => import('pages/MySettingsPage.vue'),
      },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
