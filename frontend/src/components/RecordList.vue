<script setup>import { ref, onMounted } from 'vue';
import { queryApi, submitApi } from '../api';
const activeTab = ref('query');
const queryRecords = ref([]);
const submitRecords = ref([]);
const loading = ref(false);
onMounted(async () => {
 await loadRecords();
});
const loadRecords = async () => {
 loading.value = true;
 try {
 const [queryRes, submitRes] = await Promise.all([
 queryApi.records({ limit: 20 }),
 submitApi.records({ limit: 20 })
 ]);
 queryRecords.value = queryRes.data;
 submitRecords.value = submitRes.data;
 } catch (err) {
 console.error('Failed to load records:', err);
 } finally {
 loading.value = false;
 }
};
const formatTime = (time) => {
 return new Date(time).toLocaleString('zh-CN');
};
const getStatusClass = (status) => {
 switch (status) {
 case 'success': return 'text-green-600 bg-green-100';
 case 'failed': return 'text-red-600 bg-red-100';
 default: return 'text-gray-600 bg-gray-100';
 }
};
</script>

<template>
  <div class="space-y-4">
    <div class="flex bg-white rounded-lg shadow-md p-1">
      <button
        @click="activeTab = 'query'"
        :class="[
          'flex-1 py-2 text-sm font-medium rounded-md transition-colors',
          activeTab === 'query' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-100'
        ]"
      >
        查询记录
      </button>
      <button
        @click="activeTab = 'submit'"
        :class="[
          'flex-1 py-2 text-sm font-medium rounded-md transition-colors',
          activeTab === 'submit' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-100'
        ]"
      >
        提交记录
      </button>
    </div>
    
    <div v-if="loading" class="card text-center py-8">
      <svg class="animate-spin h-8 w-8 text-gray-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    </div>
    
    <div v-else-if="activeTab === 'query' && queryRecords.length === 0" class="card text-center py-8 text-gray-500">
      暂无查询记录
    </div>
    
    <div v-else-if="activeTab === 'submit' && submitRecords.length === 0" class="card text-center py-8 text-gray-500">
      暂无提交记录
    </div>
    
    <div v-else-if="activeTab === 'query'" class="space-y-2">
      <div v-for="record in queryRecords" :key="record.id" class="card">
        <div class="flex items-center justify-between mb-2">
          <span class="font-medium text-gray-800">{{ record.region }}</span>
          <span :class="['px-2 py-1 rounded text-xs font-medium', getStatusClass(record.status)]">
            {{ record.status === 'success' ? '成功' : '失败' }}
          </span>
        </div>
        <div class="text-sm text-gray-500 mb-2">{{ formatTime(record.query_time) }}</div>
        <div v-if="record.message" class="text-sm text-red-500">{{ record.message }}</div>
        <div v-if="record.data && record.data.length > 0" class="mt-2">
          <div class="text-xs text-gray-400 mb-1">数据条数: {{ record.data.length }}</div>
          <div class="max-h-32 overflow-auto">
            <pre class="text-xs text-gray-600">{{ JSON.stringify(record.data, null, 2) }}</pre>
          </div>
        </div>
      </div>
    </div>
    
    <div v-else class="space-y-2">
      <div v-for="record in submitRecords" :key="record.id" class="card">
        <div class="flex items-center justify-between mb-2">
          <span class="font-medium text-gray-800">{{ record.region }}</span>
          <span :class="['px-2 py-1 rounded text-xs font-medium', getStatusClass(record.status)]">
            {{ record.status === 'success' ? '成功' : '失败' }}
          </span>
        </div>
        <div class="text-sm text-gray-500 mb-2">{{ formatTime(record.submit_time) }}</div>
        <div v-if="record.response" class="text-sm text-green-600">反馈: {{ record.response }}</div>
        <div v-if="record.form_data" class="mt-2">
          <div class="text-xs text-gray-400 mb-1">提交数据:</div>
          <pre class="text-xs text-gray-600">{{ JSON.stringify(record.form_data, null, 2) }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>