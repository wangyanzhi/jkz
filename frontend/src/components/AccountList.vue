<script setup>import { ref, onMounted } from 'vue';
import { accountsApi } from '../api';
const accounts = ref([]);
const loading = ref(false);
const error = ref('');
const showAddModal = ref(false);
const showEditModal = ref(false);
const formData = ref({
 username: '',
 password: '',
 region: '',
 unit_name: ''
});
const editingId = ref(null);
onMounted(async () => {
 await loadAccounts();
});
const loadAccounts = async () => {
 loading.value = true;
 try {
 const response = await accountsApi.list();
 accounts.value = response.data;
 } catch (err) {
 error.value = err.response?.data?.error || '加载失败';
 } finally {
 loading.value = false;
 }
};
const openAddModal = () => {
 formData.value = { username: '', password: '', region: '', unit_name: '' };
 showAddModal.value = true;
};
const openEditModal = (account) => {
 formData.value = { ...account };
 editingId.value = account.id;
 showEditModal.value = true;
};
const handleSave = async () => {
 if (!formData.value.username || !formData.value.password || !formData.value.region) {
 error.value = '请填写必填项';
 return;
 }
 try {
 if (editingId.value) {
 await accountsApi.update(editingId.value, formData.value);
 } else {
 await accountsApi.create(formData.value);
 }
 await loadAccounts();
 showAddModal.value = false;
 showEditModal.value = false;
 error.value = '';
 } catch (err) {
 error.value = err.response?.data?.error || '保存失败';
 }
};
const handleDelete = async (id) => {
 if (!confirm('确定要删除这个账号吗？'))
 return;
 try {
 await accountsApi.delete(id);
 await loadAccounts();
 } catch (err) {
 error.value = err.response?.data?.error || '删除失败';
 }
};
</script>

<template>
  <div class="space-y-4">
    <div class="card">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold text-gray-800">账号管理</h2>
        <button @click="openAddModal" class="btn btn-success">
          添加账号
        </button>
      </div>
      
      <div v-if="error" class="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
        {{ error }}
      </div>
      
      <div v-if="loading" class="text-center py-8">
        <svg class="animate-spin h-8 w-8 text-gray-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
      
      <div v-else-if="accounts.length === 0" class="text-center py-8 text-gray-500">
        暂无账号，请添加
      </div>
      
      <div v-else class="space-y-2">
        <div v-for="account in accounts" :key="account.id" class="p-3 bg-gray-50 rounded-lg">
          <div class="flex items-start justify-between">
            <div>
              <div class="font-medium text-gray-800">{{ account.region }}</div>
              <div class="text-sm text-gray-500">{{ account.unit_name }}</div>
              <div class="text-xs text-gray-400 mt-1">用户名: {{ account.username }}</div>
            </div>
            <div class="flex gap-2">
              <button @click="openEditModal(account)" class="btn btn-primary text-sm">编辑</button>
              <button @click="handleDelete(account.id)" class="btn btn-danger text-sm">删除</button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div v-if="showAddModal || showEditModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-lg w-full max-w-md">
        <div class="p-4 border-b">
          <h3 class="text-lg font-semibold">
            {{ editingId ? '编辑账号' : '添加账号' }}
          </h3>
        </div>
        <div class="p-4 space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">用户名</label>
            <input v-model="formData.username" type="text" class="form-input" placeholder="目标网站用户名" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">密码</label>
            <input v-model="formData.password" type="password" class="form-input" placeholder="目标网站密码" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">区域 *</label>
            <input v-model="formData.region" type="text" class="form-input" placeholder="区域标识" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">单位名称</label>
            <input v-model="formData.unit_name" type="text" class="form-input" placeholder="单位名称" />
          </div>
          <div class="flex gap-2">
            <button
              @click="showAddModal = false; showEditModal = false"
              class="btn btn-secondary flex-1"
            >
              取消
            </button>
            <button @click="handleSave" class="btn btn-primary flex-1">
              保存
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>