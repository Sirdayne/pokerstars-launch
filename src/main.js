import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

const GET_EVENTS = {
    // The game will be paused - the whole UI will be disabled!
    LAUNCH: 'xc2rgLaunchGame',
    // The game will be resumed to the state before it has been paused.
    CUSTOM: 'xc2rgCustomName',
};

window.addEventListener('message', onCasinoMessage, false);

function onCasinoMessage(eventData) {
    if (!eventData.data) return;

    let message = eventData.data;
    if (typeof (message) === 'string') {
        try {
            message = JSON.parse(message);
        } catch (e) {
            return;
        }
    }

    switch (message.msgId) {
        case GET_EVENTS.LAUNCH:
            console.log(message.keysAndValues, 'launch event')
            break;
        case GET_EVENTS.CUSTOM:
            console.log('custom event')
            break;
    }
}

createApp(App).mount('#app')
