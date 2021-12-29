import { defineConfig } from 'umi';

export default defineConfig({
  nodeModulesTransform: {
    type: 'none',
  },
  theme: {
    '@primary-color': '#4e44ce',
  },
  routes: [
    {
      path: '/',
      component: '@/layouts/Basic',
      routes: [
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
