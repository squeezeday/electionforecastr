import Vue from 'vue'
import Router from 'vue-router'
import Myelection from '@/components/Myelection'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/:year',
      name: 'MyelectionYear',
      component: Myelection
    },
    {
      path: '/',
      name: 'Myelection',
      component: Myelection
    }
  ]
})
