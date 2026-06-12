<script setup>import { ref, onMounted } from 'vue';
import { accountsApi, queryApi } from '../api';
const regions = ref([]);
const selectedRegion = ref('');
const loading = ref(false);
const error = ref('');
const result = ref(null);
onMounted(async () => {
 try {
 const response = await accountsApi.regions();
 regions.value = response.data;
 } catch (err) {
 console.error('Failed to load regions:', err);
 }
});
const handleQuery = async () => {
 if (!selectedRegion.value) {
 error.value = '请选择区域';
 return;
 }
 loading.value = true;
 error.value = '';
 result.value = null;
 try {
 const response = await queryApi.byRegion({ region: selectedRegion.value });
 result.value = response.data;
 } catch (err) {
 error.value = err.response?.data?.error || '查询失败';
 } finally {
 loading.value = false;
 }
};
const getTableHeaders = () => {
 if (!result.value?.data || result.value.data.length === 0)
 return [];
 return Object.keys(result.value.data[0]);
};
</script>

<template>
  <div class="space-y-4">
    <div class="card">
      <h2 class="text-lg font-semibold text-gray-800 mb-4">数据查询</h2>
      
      <div v-if="error" class="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
        {{ error }}
      </div>
      
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">选择区域</label>
          <select v-model="selectedRegion" class="form-select">
            <option value="">请选择区域</option>
            <option v-for="r in regions" :key="r.region" :value="r.region">
              {{ r.region }} - {{ r.unit_name }}
            </option>
          </select>
        </div>
        
        <button
          @click="handleQuery"
          :disabled="loading || !selectedRegion"
          class="btn btn-primary w-full"
        >
          <span v-if="loading" class="flex items-center justify-center">
            <svg class="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            查询中...
          </span>
          <span v-else>开始查询</span>
        </button>
      </div>
    </div>
    
    <div v-if="result" class="card">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-md font-semibold text-gray-800">
          查询结果 - {{ result.region }}
        </h3>
        <span class="text-sm text-gray-500">{{ result.unit_name }}</span>
      </div>
      
      <div v-if="result.data && result.data.length > 0" class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-gray-50">
              <th v-for="header in getTableHeaders()" :key="header" class="px-3 py-2 text-left font-medium text-gray-600">
                {{ header }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, index) in result.data" :key="index" class="border-b border-gray-200">
              <td v-for="header in getTableHeaders()" :key="header" class="px-3 py-2">
                {{ row[header] }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div v-else class="text-center py-8 text-gray-500">
        暂无数据
      </div>
    </div>
  </div>
</template>