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

    const redirectToGame = (data) => {
        const url = data && data.url ? data.url : '';
        if (url) {
            window.location.href = url;
        }
    }

    const fetchGameUrl = (message) => {
        const body = message && message.keysAndValues ? message.keysAndValues : {};
        const url = `${import.meta.env.VITE_APP_HOST}/pokerstars/pokerstars-stg/launch`;
        fetch(url, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body)
        }).then(res => res.json()).then(data => {
            console.log(data, ' DATA from Pokerstars launch');
            redirectToGame(data);
        }).catch((error) => {
            console.log('Fetch Error: ', error)
            const data = {"url": `${import.meta.env.VITE_APP_HOST}/games/MultihandBlackjack/FUN/arstoiearnst`};
            console.log( data, ' Err data')
            // redirectToGame(data);
        });
    }

    switch (message.msgId) {
        case GET_EVENTS.LAUNCH:
            console.log(message.keysAndValues, 'post message: launch event');
            fetchGameUrl(message);
            break;
        case GET_EVENTS.CUSTOM:
            console.log('custom event')
            break;
    }
}

createApp(App).mount('#app')
