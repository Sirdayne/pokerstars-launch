import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

const GET_EVENTS = {
    // Launch game event from xt to our client, after it redirect to game
    LAUNCH: 'xc2rgLaunchGame',
    // Here will be custom events
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

    const redirectGame = (message) => {
        const body = message && message.keysAndValues ? message.keysAndValues : {};
        const url = `https://int.bgaming-systems.com/pokerstars/pokerstars-stg/launch`;
        fetch(url, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body)
        }).then(res => res.json()).then(data => {
            console.log(data, ' DATA from Pokerstars launch');
        }).catch((error) => {
            console.log('Fetch Error: ', error)
        });
    }

    switch (message.msgId) {
        case GET_EVENTS.LAUNCH:
            console.log(message.keysAndValues, 'post message: launch event');
            redirectGame(message);
            break;
        case GET_EVENTS.CUSTOM:
            console.log('custom event')
            break;
    }
}

createApp(App).mount('#app')
