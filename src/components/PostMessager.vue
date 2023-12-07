<script setup>
import { onMounted } from 'vue'

const message = {
  "msgId": "xc2rgLaunchGame",
  "keysAndValues": {
    "userId": "4-16852454xQA8740981825",
    "rgToken": "000000020900CC410682674242A042A6A526F71375078342A409391b9322847ddb5674da1eea7xQA",
    "siteId": 2,
    "hostId": 2,
    "platform": 1,
    "isNewSession": true,
    "currency": "USD",
    "languageCode": "en",
    "countryCode": "AG",
    "playForFun": true,
    "soundEnabled": true,
    "vendorGameConfig": "MultihandBlackjack",
    "showPlayMoneyWithDecimal": true
  }
};

onMounted(() => {
  setTimeout(() => {
    window.postMessage(message);
  }, 1500);
})
</script>

<template>
  <h1>Post Messager</h1>
</template>

<style scoped>
</style>
