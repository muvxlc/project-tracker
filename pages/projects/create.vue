<script setup lang="ts">
const toast = useToast();

const { data: years } = await useAsyncData('fiscal_years', () => $fetch('/api/master/fiscal-years'));
const { data: quarters } = await useAsyncData('quarters', () => $fetch('/api/master/quarters'));
const { data: categories } = await useAsyncData('categories', () => $fetch('/api/master/categories'));
const { data: agencies } = await useAsyncData('agencies', () => $fetch('/api/master/agencies'));
const { data: responsiblePersons } = await useAsyncData('responsible_persons', () => $fetch('/api/master/responsible-persons'));
const { data: statuses } = await useAsyncData('project_statuses', () => $fetch('/api/master/statuses'));

const form = ref({
  name: '',
  fiscalYearId: '' as any,
  quarterId: '' as any,
  categoryId: '' as any,
  agencyId: '' as any,
  responsibleId: '' as any,
  statusId: '' as any,
  implementationDate: null,
  completionDate: null,
  budget: 0,
  description: ''
});

const selectedStatusName = computed(() => {
  if (!statuses.value || !form.value.statusId) return '';
  const found = (statuses.value as any[]).find(s => s.id === Number(form.value.statusId));
  return found ? found.name : '';
});

// Default status to 'รับเอกสาร'
watch(statuses, (newStatuses) => {
  if (newStatuses && !form.value.statusId) {
    const receivedStatus = (newStatuses as any[]).find((s: any) => s.name === 'รับเอกสาร');
    if (receivedStatus) form.value.statusId = receivedStatus.id;
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

const submitProject = async () => {
  if (!form.value.name || !form.value.fiscalYearId || !form.value.categoryId || !form.value.agencyId || !form.value.responsibleId || !form.value.statusId) {
    toast.add({ title: 'คำเตือน', description: 'กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน', color: 'warning' });
    return;
  }

  loading.value = true;
  try {
    // 1. Create Project
    const project: any = await $fetch('/api/projects', {
      method: 'POST',
      body: {
        ...form.value,
        fiscalYearId: Number(form.value.fiscalYearId),
        quarterId: form.value.quarterId ? Number(form.value.quarterId) : null,
        categoryId: Number(form.value.categoryId),
        agencyId: Number(form.value.agencyId),
        responsibleId: Number(form.value.responsibleId),
        statusId: Number(form.value.statusId),
        completionDate: selectedStatusName.value === 'ดำเนินการเสร็จสิ้น' ? form.value.completionDate : null,
        budget: form.value.budget.toString()
      },
    });

    // 2. Upload Files if any
    if (files.value.length > 0) {
      const formData = new FormData();
      formData.append('projectId', project.id.toString());
      files.value.forEach(item => {
        formData.append('files', item.file);
        formData.append('notes', item.note || '');
      });

      await $fetch('/api/projects/upload', {
        method: 'POST',
        body: formData
      });
    }

    toast.add({ title: 'สำเร็จ', description: 'เพิ่มโครงการและอัปโหลดไฟล์เรียบร้อยแล้ว', color: 'success' });
    await navigateTo('/');
  } catch (e: any) {
    toast.add({ title: 'เกิดข้อผิดพลาด', description: e.statusMessage || 'ไม่สามารถเพิ่มโครงการได้', color: 'error' });
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="max-w-4xl mx-auto py-8 font-thai">
    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <h1 class="text-2xl font-bold">เพิ่มโครงการใหม่</h1>
          <UButton to="/" variant="ghost" label="ยกเลิก" color="gray" icon="i-heroicons-x-mark" />
        </div>
      </template>

      <form @submit.prevent="submitProject" class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <UFormField label="ชื่อโครงการ" class="md:col-span-2" required>
            <UInput v-model="form.name" placeholder="ระบุชื่อโครงการ" required size="lg" />
          </UFormField>

          <UFormField label="ปีงบประมาณ" required>
            <select v-model="form.fiscalYearId" class="w-full h-10 px-3 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-primary focus:outline-none">
              <option value="" disabled>-- เลือกปีงบประมาณ --</option>
              <option v-for="y in years" :key="y.id" :value="y.id">{{ y.year }}</option>
            </select>
          </UFormField>

          <UFormField label="ไตรมาส">
            <select v-model="form.quarterId" class="w-full h-10 px-3 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-primary focus:outline-none">
              <option value="">-- เลือกไตรมาส (ถ้ามี) --</option>
              <option v-for="q in quarters" :key="q.id" :value="q.id">{{ q.name }}</option>
            </select>
          </UFormField>

          <UFormField label="ประเภทโครงการ" required>
            <select v-model="form.categoryId" class="w-full h-10 px-3 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-primary focus:outline-none">
              <option value="" disabled>-- เลือกประเภทโครงการ --</option>
              <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
            </select>
          </UFormField>

          <UFormField label="หน่วยงานที่รับผิดชอบ" required>
            <select v-model="form.agencyId" class="w-full h-10 px-3 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-primary focus:outline-none">
              <option value="" disabled>-- เลือกหน่วยงาน --</option>
              <option v-for="a in agencies" :key="a.id" :value="a.id">{{ a.name }}</option>
            </select>
          </UFormField>

          <UFormField label="ผู้รับผิดชอบ" required>
            <select v-model="form.responsibleId" class="w-full h-10 px-3 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-primary focus:outline-none">
              <option value="" disabled>-- เลือกผู้รับผิดชอบ --</option>
              <option v-for="r in responsiblePersons" :key="r.id" :value="r.id">{{ r.name }}</option>
            </select>
          </UFormField>

          <UFormField label="สถานะปัจจุบัน" required>
            <select v-model="form.statusId" class="w-full h-10 px-3 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-primary focus:outline-none">
              <option value="" disabled>-- เลือกสถานะ --</option>
              <option v-for="s in statuses" :key="s.id" :value="s.id">{{ s.name }}</option>
            </select>
          </UFormField>

          <UFormField label="วันที่ดำเนินการ" required>
            <UInput v-model="form.implementationDate" type="date" required icon="i-heroicons-calendar-days" />
          </UFormField>

          <UFormField v-if="selectedStatusName === 'ดำเนินการเสร็จสิ้น'" label="วันที่เสร็จสิ้น" required>
            <UInput v-model="form.completionDate" type="date" required icon="i-heroicons-calendar-check" />
          </UFormField>

          <UFormField label="งบประมาณ (บาท)" required>
            <UInput v-model="form.budget" type="number" step="0.01" required icon="i-heroicons-banknotes" />
          </UFormField>

          <UFormField label="รายละเอียดเพิ่มเติม" class="md:col-span-2">
            <UTextarea v-model="form.description" placeholder="ระบุรายละเอียดโครงการ (ถ้ามี)..." :rows="8" class="w-full" />
          </UFormField>

          <UFormField label="เอกสารโครงการ" class="md:col-span-2">
            <div class="flex items-center justify-center w-full">
              <label class="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500">
                <div class="flex flex-col items-center justify-center pt-5 pb-6">
                  <UIcon name="i-heroicons-cloud-arrow-up" class="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" />
                  <p class="mb-2 text-sm text-gray-500 dark:text-gray-400 font-semibold text-center">
                    คลิกเพื่ออัปโหลด หรือลากไฟล์มาวางที่นี่
                  </p>
                  <p class="text-xs text-gray-500 dark:text-gray-400">PDF, DOCX, JPG (ขนาดไม่เกิน 30MB)</p>
                </div>
                <input type="file" class="hidden" multiple @change="onFileChange" />
              </label>
            </div>
            <div v-if="files.length > 0" class="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border">
              <p class="text-sm font-bold mb-3 flex items-center gap-2">
                <UIcon name="i-heroicons-paper-clip" />
                ไฟล์ที่เลือก ({{ files.length }} ไฟล์)
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
                  <div class="flex flex-col gap-1 w-full">
                    <UInput v-model="item.note" placeholder="เพิ่มบันทึก/หมายเหตุ (ไม่บังคับ)" size="sm" icon="i-heroicons-pencil-square" class="w-full" />
                  </div>
                </li>
              </ul>
            </div>
          </UFormField>
        </div>

        <div class="pt-4 flex justify-end gap-3 border-t">
          <UButton to="/" variant="ghost" label="ยกเลิก" color="gray" />
          <UButton type="submit" label="บันทึกข้อมูลโครงการ" size="lg" :loading="loading" icon="i-heroicons-check" />
        </div>
      </form>
    </UCard>
  </div>
</template>
