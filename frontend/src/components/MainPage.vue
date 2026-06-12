<script setup>import { ref } from 'vue';
import { adminApi, accountsApi, queryApi, submitApi } from '../api';
import AccountList from './AccountList.vue';
import QueryPanel from './QueryPanel.vue';
import SubmitPanel from './SubmitPanel.vue';
import RecordList from './RecordList.vue';
const emit = defineEmits(['logout']);
const activeTab = ref('query');
const username = ref(localStorage.getItem('username') || '');
const tabs = [
 { id: 'query', label: '数据查询' },
 { id: 'submit', label: '表单提交' },
 { id: 'accounts', label: '账号管理' },
 { id: 'records', label: '历史记录' }
];
const handleLogout = async () => {
 try {
 await adminApi.logout();
 } finally {
 emit('logout');
 }
};
</script>

<template>
  <div class="min-h-screen bg-gray-100">
    <header class="bg-white shadow-sm sticky top-0 z-10">
      <div class="px-4 py-3">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-lg font-bold text-gray-800">数据查询系统</h1>
            <p class="text-sm text-gray-500">{{ username }}</p>
          </div>
          <button @click="handleLogout" class="btn btn-secondary text-sm">
            退出登录
          </button>
        </div>
      </div>
      
      <nav class="border-t border-gray-200">
        <div class="flex overflow-x-auto">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="[
              'flex-shrink-0 px-4 py-3 text-sm font-medium transition-colors',
              activeTab === tab.id 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            ]"
          >
            {{ tab.label }}
          </button>
        </div>
      </nav>
    </header>
    
    <main class="p-4">
      <QueryPanel v-if="activeTab === 'query'" />
      <SubmitPanel v-else-if="activeTab === 'submit'" />
      <AccountList v-else-if="activeTab === 'accounts'" />
      <RecordList v-else-if="activeTab === 'records'" />
    </main>
  </div>
</template>