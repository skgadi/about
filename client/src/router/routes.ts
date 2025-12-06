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
        component: () => import('pages/SignIn.vue'),
      },
      {
        name: 'sign-up',
        path: 'sign-up',
        component: () => import('pages/SignUp.vue'),
      },
      {
        name: 'sign-out',
        path: 'sign-out',
        component: () => import('pages/SignOut.vue'),
      },
      {
        name: 'forgot-password',
        path: 'forgot-password',
        component: () => import('pages/ForgotPassword.vue'),
      },
      {
        name: 'reset-password',
        path: 'reset-password',
        component: () => import('pages/ResetPassword.vue'),
      },
      {
        path: 'v/:urlUserId',
        name: 'view-public-user-profile',
        component: () => import('pages/View/ProfileIndex.vue'),
        children: [
          {
            path: 'docs',
            name: 'view-public-user-documents',
            component: () => import('pages/View/ProfileDocuments.vue'),
          },
        ],
      },
      {
        path: 'e/:urlUserId',
        name: 'edit-user-profile',
        component: () => import('pages/Edit/ProfileIndex.vue'),
      },
      {
        path: 's/:urlUserId',
        name: 'settings-page',
        component: () => import('pages/SettingsPage.vue'),
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
