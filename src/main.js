import { createApp } from 'vue'
import App from './App.vue'
// import signalr from './utils/signalR'
import axios from 'axios'
import './assets/main.css'

const app = createApp(App)
// app.config.globalProperties.$signalr = signalr.signal;
axios.defaults.baseURL = "https://localhost:7115"
app.config.globalProperties.$http = axios;
app.mount('#app')
