import Vue from 'vue'
import Router from 'vue-router'
import Conversation from '@/components/Conversation/Conversation'
import Signup from '@/components/User/Signup'
import Signin from '@/components/User/Signin'
import AuthGuard from './auth-guard'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      redirect: '/chat/',
      beforeEnter: AuthGuard
    },
    {
      path: '/login',
      name: 'Signin',
      component: Signin
    },
    {
      path: '/register',
      name: 'Signup',
      component: Signup
    },
    {
      path: '/chat/:id',
      name: 'Conversation',
      component: Conversation,
      props: true,
      beforeEnter: AuthGuard
    },
    {
      path: '/chat/',
      name: 'ChatMain',
      component: Conversation,
      props: true,
      beforeEnter: AuthGuard
    }
  ],
  mode: 'history'
})
