<script setup lang="ts">
const route = useRoute();
const id = route.params.id;
const toast = useToast();

// Fetch all necessary data
const { data: project, status: projectStatus } = await useAsyncData(`project_${id}`, () => $fetch(`/api/projects/${id}`));
const { data: years } = await useAsyncData('fiscal_years', () => $fetch('/api/master/fiscal-years'));
const { data: quarters } = await useAsyncData('quarters', () => $fetch('/api/master/quarters'));
const { data: categories } = await useAsyncData('categories', () => $fetch('/api/master/categories'));
const { data: agencies } = await useAsyncData('agencies', () => $fetch('/api/master/agencies'));
const { data: responsiblePersons } = await useAsyncData('responsible_persons', () => $fetch('/api/master/responsible-persons'));
const { data: budgetSources } = await useAsyncData('budget_sources', () => $fetch('/api/master/budget-sources'));
const { data: statuses } = await useAsyncData('project_statuses', () => $fetch('/api/master/statuses'));

const form = ref({
  name: '',
  fiscalYearId: '' as any,
  quarterId: '' as any,
  categoryId: '' as any,
  agencyId: '' as any,
  responsibleId: '' as any,
  budgetSourceId: '' as any,
  statusId: '' as any,
  implementationDate: null as any,
  completionDate: null as any,
  initialBudget: 0,
  actualBudget: 0,
  budget: 0,
  description: ''
});

const displayInitialBudget = ref('0');
const displayActualBudget = ref('0');

const formatNumber = (val: string | number) => {
  if (val === undefined || val === null || val === '') return '';
  const s = val.toString().replace(/,/g, '');
  if (isNaN(Number(s))) return '';
  const parts = s.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return parts.join('.');
};

const onInitialBudgetInput = (e: any) => {
  const input = e.target.value.replace(/[^0-9.]/g, '');
  const parts = input.split('.');
  const sanitized = parts[0] + (parts.length > 1 ? '.' + parts.slice(1).join('').substring(0, 2) : '');
  
  form.value.initialBudget = Number(sanitized) || 0;
  displayInitialBudget.value = formatNumber(sanitized);
};

const onActualBudgetInput = (e: any) => {
  const input = e.target.value.replace(/[^0-9.]/g, '');
  const parts = input.split('.');
  const sanitized = parts[0] + (parts.length > 1 ? '.' + parts.slice(1).join('').substring(0, 2) : '');
  
  form.value.actualBudget = Number(sanitized) || 0;
  displayActualBudget.value = formatNumber(sanitized);
};

const selectedStatusName = computed(() => {
  const statusList = toValue(statuses);
  if (!statusList || !form.value.statusId) return '';
  const found = (statusList as any[]).find(s => s.id === Number(form.value.statusId));
  return found ? found.name : '';
});

// Watch for project data and populate form
watch(project, (newVal) => {
  if (newVal) {
    form.value = {
      name: newVal.name || '',
      fiscalYearId: newVal.fiscalYearId || '',
      quarterId: newVal.quarterId || '',
      categoryId: newVal.categoryId || '',
      agencyId: newVal.agencyId || '',
      responsibleId: newVal.responsibleId || '',
      budgetSourceId: newVal.budgetSourceId || '',
      statusId: newVal.statusId || '',
      implementationDate: newVal.implementationDate ? newVal.implementationDate.split('T')[0] : null,
      completionDate: newVal.completionDate ? newVal.completionDate.split('T')[0] : null,
      initialBudget: Number(newVal.initialBudget) || Number(newVal.budget) || 0,
      actualBudget: Number(newVal.actualBudget) || 0,
      budget: Number(newVal.budget) || 0,
      description: newVal.description || ''
    };
    displayInitialBudget.value = formatNumber(form.value.initialBudget.toString());
    displayActualBudget.value = formatNumber(form.value.actualBudget.toString());
  }
}, { immediate: true });

const files = ref<{ file: File, note: string }[]>([]);
const loading = ref(false);

const onFileChange = (event: any) => {
  const newFiles = Array.from(event.target.files as FileList).map(file => ({
    file,
    note: ''
  }));
  files.value = [...files.value, ...newFiles];
};

const removeFile = (index: number) => {
  files.value.splice(index, 1);
};

const editingFile = ref<{ id: number, note: string } | null>(null);
const isNoteModalOpen = ref(false);

const deleteExistingFile = async (fileId: number) => {
  if (!confirm('ยืนยันการลบไฟล์นี้ใช่หรือไม่?')) return;
  
  try {
    await $fetch(`/api/projects/files/${fileId}`, { method: 'DELETE' });
    toast.add({ title: 'สำเร็จ', description: 'ลบไฟล์เรียบร้อยแล้ว', color: 'success' });
    // Refresh project data to update the UI
    const { data: refreshed } = await useFetch(`/api/projects/${id}`);
    if (refreshed.value) project.value = refreshed.value;
  } catch (e: any) {
    toast.add({ title: 'เกิดข้อผิดพลาด', description: 'ไม่สามารถลบไฟล์ได้', color: 'error' });
  }
};

const startEditNote = (file: any) => {
  editingFile.value = { id: file.id, note: file.note || '' };
  isNoteModalOpen.value = true;
};

const saveNote = async () => {
  if (!editingFile.value) return;
  
  try {
    await $fetch(`/api/projects/files/${editingFile.value.id}`, {
      method: 'PATCH',
      body: { note: editingFile.value.note }
    });
    toast.add({ title: 'สำเร็จ', description: 'อัปเดตหมายเหตุเรียบร้อยแล้ว', color: 'success' });
    isNoteModalOpen.value = false;
    editingFile.value = null;
    // Refresh project data
    const { data: refreshed } = await useFetch(`/api/projects/${id}`);
    if (refreshed.value) project.value = refreshed.value;
  } catch (e: any) {
    toast.add({ title: 'เกิดข้อผิดพลาด', description: 'ไม่สามารถอัปเดตได้', color: 'error' });
  }
};

const updateProject = async () => {
  if (!form.value.name || !form.value.fiscalYearId || !form.value.categoryId || !form.value.agencyId || !form.value.responsibleId || !form.value.statusId) {
    toast.add({ title: 'คำเตือน', description: 'กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน', color: 'warning' });
    return;
  }

  loading.value = true;
  try {
    // 1. Update Project
    await $fetch(`/api/projects/${id}`, {
      method: 'PATCH',
      body: {
        ...form.value,
        fiscalYearId: Number(form.value.fiscalYearId),
        quarterId: form.value.quarterId ? Number(form.value.quarterId) : null,
        categoryId: Number(form.value.categoryId),
        agencyId: Number(form.value.agencyId),
        responsibleId: Number(form.value.responsibleId),
        budgetSourceId: form.value.budgetSourceId ? Number(form.value.budgetSourceId) : null,
        statusId: Number(form.value.statusId),
        completionDate: selectedStatusName.value === 'ดำเนินการเสร็จสิ้น' ? form.value.completionDate : null,
        initialBudget: form.value.initialBudget.toString(),
        actualBudget: form.value.actualBudget.toString(),
        budget: form.value.initialBudget.toString()
      }
    });

    // 2. Upload new files if any
    if (files.value.length > 0) {
      const formData = new FormData();
      formData.append('projectId', id.toString());
      files.value.forEach(item => {
        formData.append('files', item.file);
        formData.append('notes', item.note || '');
      });

      await $fetch('/api/projects/upload', {
        method: 'POST',
        body: formData
      });
    }

    toast.add({ title: 'สำเร็จ', description: 'อัปเดตข้อมูลโครงการเรียบร้อยแล้ว', color: 'success' });
    await navigateTo('/');
  } catch (e: any) {
    toast.add({ title: 'เกิดข้อผิดพลาด', description: e.statusMessage || 'ไม่สามารถอัปเดตข้อมูลได้', color: 'error' });
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="max-w-4xl mx-auto py-8 font-thai">
    <div v-if="projectStatus === 'pending'" class="flex justify-center items-center py-20">
      <UIcon name="i-heroicons-arrow-path" class="w-10 h-10 animate-spin text-primary" />
      <span class="ml-3 text-lg">กำลังโหลดข้อมูลโครงการ...</span>
    </div>

    <UCard v-else>
      <template #header>
        <div class="flex items-center justify-between">
          <h1 class="text-2xl font-bold">แก้ไขข้อมูลโครงการ</h1>
          <UButton to="/" variant="ghost" label="ยกเลิก" color="gray" icon="i-heroicons-x-mark" />
        </div>
      </template>

      <form @submit.prevent="updateProject" class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <UFormField label="ชื่อโครงการ" class="md:col-span-2" required>
            <UInput v-model="form.name" placeholder="ระบุชื่อโครงการ" required size="lg" />
          </UFormField>

          <UFormField label="ปีงบประมาณ" required>
            <select v-model="form.fiscalYearId" class="w-full h-10 px-3 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-primary focus:outline-none">
              <option value="" disabled>-- เลือกปีงบประมาณ --</option>
              <option v-for="y in (years as any[])" :key="y.id" :value="y.id">{{ y.year }}</option>
            </select>
          </UFormField>

          <UFormField label="ไตรมาส">
            <select v-model="form.quarterId" class="w-full h-10 px-3 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-primary focus:outline-none">
              <option value="">-- เลือกไตรมาส (ถ้ามี) --</option>
              <option v-for="q in (quarters as any[])" :key="q.id" :value="q.id">{{ q.name }}</option>
            </select>
          </UFormField>

          <UFormField label="ประเภทโครงการ" required>
            <select v-model="form.categoryId" class="w-full h-10 px-3 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-primary focus:outline-none">
              <option value="" disabled>-- เลือกประเภทโครงการ --</option>
              <option v-for="c in (categories as any[])" :key="c.id" :value="c.id">{{ c.name }}</option>
            </select>
          </UFormField>

          <UFormField label="หน่วยงานที่รับผิดชอบ" required>
            <select v-model="form.agencyId" class="w-full h-10 px-3 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-primary focus:outline-none">
              <option value="" disabled>-- เลือกหน่วยงาน --</option>
              <option v-for="a in (agencies as any[])" :key="a.id" :value="a.id">{{ a.name }}</option>
            </select>
          </UFormField>

          <UFormField label="ผู้รับผิดชอบ" required>
            <select v-model="form.responsibleId" class="w-full h-10 px-3 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-primary focus:outline-none">
              <option value="" disabled>-- เลือกผู้รับผิดชอบ --</option>
              <option v-for="r in (responsiblePersons as any[])" :key="r.id" :value="r.id">{{ r.name }}</option>
            </select>
          </UFormField>

          <UFormField label="สถานะปัจจุบัน" required>
            <select v-model="form.statusId" class="w-full h-10 px-3 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-primary focus:outline-none">
              <option value="" disabled>-- เลือกสถานะ --</option>
              <option v-for="s in (statuses as any[])" :key="s.id" :value="s.id">{{ s.name }}</option>
            </select>
          </UFormField>

          <UFormField label="แหล่งที่มาของงบประมาณ">
            <select v-model="form.budgetSourceId" class="w-full h-10 px-3 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-primary focus:outline-none">
              <option value="">-- เลือกแหล่งที่มาของงบประมาณ --</option>
              <option v-for="bs in (budgetSources as any[])" :key="bs.id" :value="bs.id">{{ bs.name }}</option>
            </select>
          </UFormField>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 md:col-span-2">
            <UFormField label="วันที่ดำเนินการ" required>
              <UInput v-model="form.implementationDate" type="date" required icon="i-heroicons-calendar-days" />
            </UFormField>

            <UFormField label="วันที่เสร็จสิ้นโครงการ">
              <UInput 
                v-model="form.completionDate" 
                type="date" 
                icon="i-heroicons-calendar-days" 
                class="bg-green-100/50 dark:bg-green-900/30 rounded-md"
                :ui="{ 
                  base: '!bg-green-100/30 dark:!bg-green-900/20 border-green-300 dark:border-green-800 focus:ring-green-500',
                  icon: { leading: { wrapper: 'text-green-600' } }
                }"
              />
            </UFormField>
          </div>

          <UFormField label="งบประมาณตั้งต้น (บาท)" required>
            <UInput 
              v-model="displayInitialBudget" 
              @update:model-value="(val) => {
                const sanitized = val.replace(/[^0-9.]/g, '');
                form.initialBudget = Number(sanitized) || 0;
                displayInitialBudget = formatNumber(sanitized);
              }"
              required 
              icon="i-heroicons-banknotes" 
            />
          </UFormField>

          <UFormField label="งบประมาณที่ใช้จริง (บาท)">
            <UInput 
              v-model="displayActualBudget" 
              @update:model-value="(val) => {
                const sanitized = val.replace(/[^0-9.]/g, '');
                form.actualBudget = Number(sanitized) || 0;
                displayActualBudget = formatNumber(sanitized);
              }"
              icon="i-heroicons-banknotes" 
            />
          </UFormField>

          <UFormField label="รายละเอียดเพิ่มเติม" class="md:col-span-2">
            <UTextarea v-model="form.description" placeholder="ระบุรายละเอียดโครงการ (ถ้ามี)..." :rows="8" class="w-full" />
          </UFormField>

          <!-- Display Existing Files -->
          <div v-if="(project as any)?.files?.length > 0" class="md:col-span-2 space-y-2">
            <p class="text-sm font-bold flex items-center gap-2">
              <UIcon name="i-heroicons-document-duplicate" />
              เอกสารปัจจุบัน
            </p>
            <div class="grid grid-cols-1 gap-2">
              <div v-for="file in (project as any).files" :key="file.id" class="flex flex-col p-3 border rounded bg-gray-50 dark:bg-gray-800 gap-1">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2 truncate">
                    <UIcon name="i-heroicons-document" />
                    <a :href="`/api/projects/files/${file.uuid}`" target="_blank" class="text-xs text-blue-600 hover:underline truncate font-medium">{{ file.filename }}</a>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="text-[10px] text-gray-400 mr-2">{{ (file.fileSize / 1024).toFixed(1) }} KB</span>
                    <UButton icon="i-heroicons-pencil-square" size="2xs" color="blue" variant="ghost" @click="startEditNote(file)" />
                    <UButton icon="i-heroicons-trash" size="2xs" color="red" variant="ghost" @click="deleteExistingFile(file.id)" />
                  </div>
                </div>
                <div v-if="file.note" class="text-[11px] text-gray-500 italic mt-1 flex items-start gap-1">
                  <UIcon name="i-heroicons-pencil-square" class="mt-0.5" />
                  <span>บันทึก: {{ file.note }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Edit Note Modal -->
          <UModal v-model:open="isNoteModalOpen" title="แก้ไขหมายเหตุ/บันทึก" @update:open="(val) => !val && (editingFile = null)">
            <template #content>
              <div class="p-8 space-y-6 flex flex-col items-center">
                <div class="w-full max-w-md space-y-4 text-center">
                  <UIcon name="i-heroicons-pencil-square" class="w-12 h-12 text-primary mx-auto opacity-20" />
                  <h3 class="text-lg font-bold">บันทึก/หมายเหตุเพิ่มเติม</h3>
                  <UFormField label="ระบุข้อมูลที่ต้องการแก้ไข" class="text-left">
                    <UTextarea v-if="editingFile" v-model="editingFile.note" placeholder="พิมพ์หมายเหตุสำหรับไฟล์นี้..." :rows="4" class="w-full" />
                  </UFormField>
                </div>
                <div class="flex justify-center gap-3 w-full border-t pt-6">
                  <UButton label="ยกเลิก" color="gray" variant="ghost" class="px-6" @click="isNoteModalOpen = false" />
                  <UButton label="บันทึกข้อมูล" color="primary" class="px-10" @click="saveNote" />
                </div>
              </div>
            </template>
          </UModal>

          <UFormField label="อัปโหลดเอกสารเพิ่มเติม" class="md:col-span-2">
            <div class="flex items-center justify-center w-full">
              <label class="flex flex-col items-center justify-center w-full h-24 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500">
                <div class="flex flex-col items-center justify-center pt-2 pb-2">
                  <UIcon name="i-heroicons-cloud-arrow-up" class="w-6 h-6 mb-2 text-gray-500 dark:text-gray-400" />
                  <p class="text-sm text-gray-500 dark:text-gray-400 font-semibold text-center">คลิกเพื่ออัปโหลด หรือลากไฟล์มาวางที่นี่</p>
                  <p class="text-[10px] text-gray-400 mt-1">PDF, DOCX, JPG (ขนาดไม่เกิน 30MB)</p>
                </div>
                <input type="file" class="hidden" multiple @change="onFileChange" />
              </label>
            </div>
            <div v-if="files.length > 0" class="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border">
              <p class="text-sm font-bold mb-3 flex items-center gap-2">
                <UIcon name="i-heroicons-paper-clip" />
                ไฟล์ที่เลือกใหม่ ({{ files.length }} ไฟล์)
              </p>
              <ul class="space-y-3">
                <li v-for="(item, index) in files" :key="item.file.name + index" class="flex flex-col gap-3 p-4 border rounded-md bg-white dark:bg-gray-900 dark:border-gray-700 shadow-sm">
                  <div class="flex items-center justify-between text-xs">
                    <div class="flex items-center gap-2 truncate">
                      <UIcon name="i-heroicons-document" class="text-gray-400" />
                      <span class="truncate font-bold text-gray-700 dark:text-gray-200">{{ item.file.name }}</span>
                    </div>
                    <div class="flex items-center gap-3">
                      <span class="text-gray-400">{{ (item.file.size / 1024).toFixed(1) }} KB</span>
                      <UButton icon="i-heroicons-trash" size="2xs" color="red" variant="ghost" @click="removeFile(index)" />
                    </div>
                  </div>
                  <UInput v-model="item.note" placeholder="เพิ่มบันทึก/หมายเหตุ (ไม่บังคับ)" size="sm" icon="i-heroicons-pencil-square" />
                </li>
              </ul>
            </div>
          </UFormField>
        </div>

        <div class="pt-4 flex justify-end gap-3 border-t">
          <UButton to="/" variant="ghost" label="ยกเลิก" color="gray" />
          <UButton type="submit" label="อัปเดตข้อมูลโครงการ" size="lg" :loading="loading" icon="i-heroicons-check" />
        </div>
      </form>
    </UCard>
  </div>
</template>
