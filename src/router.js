import { createRouter, createWebHistory } from 'vue-router'
import InputBoard from './components/InputBoard.vue'
import SearchBoard from './components/SearchBoard.vue'
import HomeBoard from './components/HomeBoard.vue'

const routes = [
    {
        path: '/input',
        component: InputBoard
    },
    {
        path: '/search',
        component: SearchBoard
    },
    {
        path: '/',
        component: HomeBoard
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router
