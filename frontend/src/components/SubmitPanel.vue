<script setup>import { ref, onMounted } from 'vue';
import { accountsApi, submitApi } from '../api';
const regions = ref([]);
const selectedRegion = ref('');
const formData = ref({
 field1: '',
 field2: '',
 field3: ''
});
const loading = ref(false);
const error = ref('');
const response = ref(null);
onMounted(async () => {
 try {
 const res = await accountsApi.regions();
 regions.value = res.data;
 } catch (err) {
 console.error('Failed to load regions:', err);
 }
});
const handleSubmit = async () => {
 if (!selectedRegion.value) {
 error.value = '请选择区域';
 return;
 }
 loading.value = true;
 error.value = '';
 response.value = null;
 try {
 const res = await submitApi.submit({
 region: selectedRegion.value,
 formData: formData.value
 });
 response.value = res.data;
 } catch (err) {
 error.value = err.response?.data?.error || '提交失败';
 } finally {
 loading.value = false;
 }
};
</script>

<template>
  <div class="space-y-4">
    <div class="card">
      <h2 class="text-lg font-semibold text-gray-800 mb-4">表单提交</h2>
      
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
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">字段1</label>
          <input v-model="formData.field1" type="text" class="form-input" placeholder="请输入字段1" />
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">字段2</label>
          <select v-model="formData.field2" class="form-select">
            <option value="">请选择</option>
            <option value="option1">选项1</option>
            <option value="option2">选项2</option>
            <option value="option3">选项3</option>
          </select>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">字段3</label>
          <input v-model="formData.field3" type="text" class="form-input" placeholder="请输入字段3" />
        </div>
        
        <button
          @click="handleSubmit"
          :disabled="loading || !selectedRegion"
          class="btn btn-primary w-full"
        >
          <span v-if="loading" class="flex items-center justify-center">
            <svg class="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            提交中...
          </span>
          <span v-else>提交表单</span>
        </button>
      </div>
    </div>
    
    <div v-if="response" class="card">
      <h3 class="text-md font-semibold text-gray-800 mb-3">提交反馈</h3>
      <div class="p-4 bg-green-50 rounded-lg">
        <p class="text-green-700">{{ response.response }}</p>
        <p class="text-sm text-gray-500 mt-2">区域: {{ response.region }}</p>
      </div>
    </div>
  </div>
</template>