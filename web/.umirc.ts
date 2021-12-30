import { defineConfig } from 'umi';

export default defineConfig({
  nodeModulesTransform: {
    type: 'none',
  },
  history: { type: 'hash' },
  theme: {
    '@primary-color': '#4e44ce',
    '@text-color': '#fff',
    '@component-background': '#04293A',

    '@input-border-color': '#064663',
    '@border-color-base': '#064663',

    '@select-item-selected-bg': '#4e44ce',
    '@select-item-active-bg': '#4e44ce',
    '@select-selection-item-bg': '#4e44ce',
    '@select-selection-item-border-color': '#064663',
  },
  routes: [
    {
      path: '/',
      component: '@/layouts/Basic',
      routes: [
        {
          path: '/',
          component: '@/pages/home',
        },
        {
          path: '/collections',
          component: '@/pages/collections',
        },
        {
          path: '/collection/:id',
          component: '@/pages/collection',
        },
        {
          path: '/create',
          component: '@/pages/create',
        },
      ],
    },
  ],
  fastRefresh: {},
});
