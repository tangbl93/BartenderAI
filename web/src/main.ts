import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import { router } from './router'
import { i18n, resolveInitialLocale, setLocale } from './i18n'
import './styles/main.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(i18n)

// Make sure <html lang> matches the resolved locale on first paint.
setLocale(resolveInitialLocale())

app.mount('#app')
