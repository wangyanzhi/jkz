<script setup>import { ref, computed } from 'vue';
import LoginPage from './components/LoginPage.vue';
import MainPage from './components/MainPage.vue';
const isLoggedIn = ref(!!localStorage.getItem('token'));
const handleLogin = () => {
 isLoggedIn.value = true;
};
const handleLogout = () => {
 localStorage.removeItem('token');
 localStorage.removeItem('username');
 isLoggedIn.value = false;
};
</script>

<template>
  <div class="page-container">
    <LoginPage v-if="!isLoggedIn" @login="handleLogin" />
    <MainPage v-else @logout="handleLogout" />
  </div>
</template>

<style scoped>
</style>