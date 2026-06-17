<script setup lang="ts">
const toast = useToast();

const { data: years, refresh: refreshYears } = await useFetch(
    "/api/master/fiscal-years",
);
const { data: categories, refresh: refreshCategories } = await useFetch(
    "/api/master/categories",
);
const { data: agencies, refresh: refreshAgencies } = await useFetch(
    "/api/master/agencies",
);
const { data: statuses, refresh: refreshStatuses } = await useFetch(
    "/api/master/statuses",
);
const { data: responsiblePersons, refresh: refreshResponsiblePersons } = await useFetch(
    "/api/master/responsible-persons",
);
const { data: budgetSources, refresh: refreshBudgetSources } = await useFetch(
    "/api/master/budget-sources",
);
const { data: quarters } = await useFetch(
    "/api/master/quarters",
);

const loading = ref({
    year: false,
    category: false,
    agency: false,
    status: false,
    responsible: false,
    budgetSource: false,
});

// Form states
const newYear = ref("");
const newCategory = ref("");
const newAgency = ref("");
const newStatus = ref({ name: "", color: "blue", order: 0 });
const newResponsible = ref({ name: "" });
const newBudgetSource = ref("");

// Edit states
const editMode = ref<{ type: string; id: number | null }>({
    type: "",
    id: null,
});
const editValue = ref<any>(null);

const colorOptions = [
    { label: "น้ำเงิน", value: "blue" },
    { label: "เขียว", value: "green" },
    { label: "เหลือง", value: "yellow" },
    { label: "แดง", value: "red" },
    { label: "ส้ม", value: "orange" },
    { label: "ม่วง", value: "purple" },
    { label: "ชมพู", value: "pink" },
    { label: "เทา", value: "gray" },
];

const addItem = async (type: "year" | "category" | "agency" | "status" | "responsible" | "budgetSource") => {
    const values = {
        year: {
            val: newYear.value,
            api: "/api/master/fiscal-years",
            body: { year: newYear.value },
            refresh: refreshYears,
        },
        category: {
            val: newCategory.value,
            api: "/api/master/categories",
            body: { name: newCategory.value },
            refresh: refreshCategories,
        },
        agency: {
            val: newAgency.value,
            api: "/api/master/agencies",
            body: { name: newAgency.value },
            refresh: refreshAgencies,
        },
        status: {
            val: newStatus.value.name,
            api: "/api/master/statuses",
            body: newStatus.value,
            refresh: refreshStatuses,
        },
        responsible: {
            val: newResponsible.value.name,
            api: "/api/master/responsible-persons",
            body: newResponsible.value,
            refresh: refreshResponsiblePersons,
        },
        budgetSource: {
            val: newBudgetSource.value,
            api: "/api/master/budget-sources",
            body: { name: newBudgetSource.value },
            refresh: refreshBudgetSources,
        },
    };

    const item = values[type];
    if (!item.val) return;

    loading.value[type] = true;
    try {
        await $fetch(item.api, { method: "POST", body: item.body });

        if (type === "status")
            newStatus.value = { name: "", color: "blue", order: 0 };
        else if (type === "responsible")
            newResponsible.value = { name: "" };
        else if (type === "year") newYear.value = "";
        else if (type === "category") newCategory.value = "";
        else if (type === "agency") newAgency.value = "";
        else if (type === "budgetSource") newBudgetSource.value = "";

        await item.refresh();
        toast.add({
            title: "สำเร็จ",
            description: `บันทึกข้อมูลเรียบร้อยแล้ว`,
            color: "success",
        });
    } catch (e: any) {
        toast.add({
            title: "เกิดข้อผิดพลาด",
            description: e.statusMessage || "ไม่สามารถบันทึกข้อมูลได้",
            color: "error",
        });
    } finally {
        loading.value[type] = false;
    }
};

const deleteItem = async (typeSlug: string, id: number, refreshFn: any) => {
    if (!confirm("คุณแน่ใจหรือไม่ว่าต้องการลบรายการนี้?")) return;
    try {
        await $fetch(`/api/master/${typeSlug}/${id}`, { method: "DELETE" });
        await refreshFn();
        toast.add({
            title: "สำเร็จ",
            description: "ลบข้อมูลเรียบร้อยแล้ว",
            color: "success",
        });
    } catch (e: any) {
        toast.add({
            title: "ผิดพลาด",
            description: "ไม่สามารถลบข้อมูลได้",
            color: "error",
        });
    }
};

const startEdit = (type: string, item: any) => {
    editMode.value = { type, id: item.id };
    editValue.value = JSON.parse(JSON.stringify(item));
};

const saveEdit = async (refreshFn: any) => {
    try {
        let typeSlug = "";
        if (editMode.value.type === "year") typeSlug = "fiscal-years";
        else if (editMode.value.type === "category") typeSlug = "categories";
        else if (editMode.value.type === "agency") typeSlug = "agencies";
        else if (editMode.value.type === "status") typeSlug = "statuses";
        else if (editMode.value.type === "responsible") typeSlug = "responsible-persons";
        else if (editMode.value.type === "budgetSource") typeSlug = "budget-sources";

        await $fetch(`/api/master/${typeSlug}/${editMode.value.id}`, {
            method: "PATCH",
            body: editValue.value,
        });

        await refreshFn();
        editMode.value = { type: "", id: null };
        toast.add({
            title: "สำเร็จ",
            description: "อัปเดตข้อมูลเรียบร้อยแล้ว",
            color: "success",
        });
    } catch (e: any) {
        toast.add({
            title: "ผิดพลาด",
            description: "ไม่สามารถอัปเดตข้อมูลได้",
            color: "error",
        });
    }
};

const getBadgeClass = (color: string) => {
    const map: Record<string, string> = {
        blue: "bg-blue-600 text-white",
        green: "bg-green-600 text-white",
        yellow: "bg-yellow-500 text-white",
        red: "bg-red-600 text-white",
        orange: "bg-orange-500 text-white",
        purple: "bg-purple-600 text-white",
        pink: "bg-pink-600 text-white",
        gray: "bg-gray-600 text-white",
    };
    return map[color] || map.blue;
};
</script>

<template>
    <div class="space-y-6 font-thai text-gray-900 dark:text-gray-100">
        <div class="flex justify-between items-center">
            <h1 class="text-2xl font-bold">ตั้งค่าข้อมูลพื้นฐาน</h1>
            <div class="flex gap-2">
                <UButton
                    label="จัดการผู้ใช้"
                    to="/admin/users"
                    variant="soft"
                    icon="i-heroicons-users"
                />
                <UButton
                    label="กลับหน้าหลัก"
                    to="/"
                    variant="ghost"
                    icon="i-heroicons-arrow-left"
                />
            </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <!-- 1. ปีงบประมาณ -->
            <UCard>
                <template #header
                    ><div
                        class="font-bold flex items-center gap-2 text-lg text-primary"
                    >
                        <UIcon name="i-heroicons-calendar" />ปีงบประมาณ
                    </div></template
                >
                <div class="flex gap-2 mb-6">
                    <UInput
                        v-model="newYear"
                        placeholder="ระบุปี (เช่น 2568)"
                        type="number"
                        class="flex-1"
                        size="lg"
                    />
                    <UButton
                        label="เพิ่ม"
                        :loading="loading.year"
                        @click="addItem('year')"
                        size="lg"
                    />
                </div>
                <ul
                    class="divide-y divide-gray-100 dark:divide-gray-800 max-h-80 overflow-y-auto pr-2"
                >
                    <li
                        v-for="y in years"
                        :key="y.id"
                        class="py-3 flex justify-between items-center group px-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    >
                        <template
                            v-if="
                                editMode.type === 'year' && editMode.id === y.id
                            "
                        >
                            <UInput
                                v-model="editValue.year"
                                type="number"
                                class="flex-1 mr-2"
                            />
                            <div class="flex gap-1">
                                <UButton
                                    icon="i-heroicons-check"
                                    size="sm"
                                    color="green"
                                    @click="saveEdit(refreshYears)"
                                />
                                <UButton
                                    icon="i-heroicons-x-mark"
                                    size="sm"
                                    color="gray"
                                    @click="editMode = { type: '', id: null }"
                                />
                            </div>
                        </template>
                        <template v-else>
                            <span class="text-lg font-medium">{{
                                y.year
                            }}</span>
                            <div
                                class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <UButton
                                    icon="i-heroicons-pencil"
                                    size="sm"
                                    variant="ghost"
                                    color="blue"
                                    @click="startEdit('year', y)"
                                />
                                <UButton
                                    icon="i-heroicons-trash"
                                    size="sm"
                                    variant="ghost"
                                    color="red"
                                    @click="
                                        deleteItem(
                                            'fiscal-years',
                                            y.id,
                                            refreshYears,
                                        )
                                    "
                                />
                            </div>
                        </template>
                    </li>
                </ul>
            </UCard>

            <!-- 2. ประเภทโครงการ -->
            <UCard>
                <template #header
                    ><div
                        class="font-bold flex items-center gap-2 text-lg text-primary"
                    >
                        <UIcon name="i-heroicons-tag" />ประเภท
                    </div></template
                >
                <div class="flex gap-2 mb-6">
                    <UInput
                        v-model="newCategory"
                        placeholder="ระบุประเภทโครงการ"
                        class="flex-1"
                        size="lg"
                    />
                    <UButton
                        label="เพิ่ม"
                        :loading="loading.category"
                        @click="addItem('category')"
                        size="lg"
                    />
                </div>
                <ul
                    class="divide-y divide-gray-100 dark:divide-gray-800 max-h-80 overflow-y-auto pr-2"
                >
                    <li
                        v-for="c in categories"
                        :key="c.id"
                        class="py-3 flex justify-between items-center group px-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    >
                        <template
                            v-if="
                                editMode.type === 'category' &&
                                editMode.id === c.id
                            "
                        >
                            <UInput
                                v-model="editValue.name"
                                class="flex-1 mr-2"
                            />
                            <div class="flex gap-1">
                                <UButton
                                    icon="i-heroicons-check"
                                    size="sm"
                                    color="green"
                                    @click="saveEdit(refreshCategories)"
                                />
                                <UButton
                                    icon="i-heroicons-x-mark"
                                    size="sm"
                                    color="gray"
                                    @click="editMode = { type: '', id: null }"
                                />
                            </div>
                        </template>
                        <template v-else>
                            <span class="text-lg font-medium">{{
                                c.name
                            }}</span>
                            <div
                                class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <UButton
                                    icon="i-heroicons-pencil"
                                    size="sm"
                                    variant="ghost"
                                    color="blue"
                                    @click="startEdit('category', c)"
                                />
                                <UButton
                                    icon="i-heroicons-trash"
                                    size="sm"
                                    variant="ghost"
                                    color="red"
                                    @click="
                                        deleteItem(
                                            'categories',
                                            c.id,
                                            refreshCategories,
                                        )
                                    "
                                />
                            </div>
                        </template>
                    </li>
                </ul>
            </UCard>

            <!-- 3. หน่วยงาน -->
            <UCard>
                <template #header
                    ><div
                        class="font-bold flex items-center gap-2 text-lg text-primary"
                    >
                        <UIcon name="i-heroicons-building-office" />กลุ่มงาน
                    </div></template
                >
                <div class="flex gap-2 mb-6">
                    <UInput
                        v-model="newAgency"
                        placeholder="ระบุชื่อหน่วยงาน"
                        class="flex-1"
                        size="lg"
                    />
                    <UButton
                        label="เพิ่ม"
                        :loading="loading.agency"
                        @click="addItem('agency')"
                        size="lg"
                    />
                </div>
                <ul
                    class="divide-y divide-gray-100 dark:divide-gray-800 max-h-80 overflow-y-auto pr-2"
                >
                    <li
                        v-for="a in agencies"
                        :key="a.id"
                        class="py-3 flex justify-between items-center group px-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    >
                        <template
                            v-if="
                                editMode.type === 'agency' &&
                                editMode.id === a.id
                            "
                        >
                            <UInput
                                v-model="editValue.name"
                                class="flex-1 mr-2"
                            />
                            <div class="flex gap-1">
                                <UButton
                                    icon="i-heroicons-check"
                                    size="sm"
                                    color="green"
                                    @click="saveEdit(refreshAgencies)"
                                />
                                <UButton
                                    icon="i-heroicons-x-mark"
                                    size="sm"
                                    color="gray"
                                    @click="editMode = { type: '', id: null }"
                                />
                            </div>
                        </template>
                        <template v-else>
                            <span class="text-lg font-medium">{{
                                a.name
                            }}</span>
                            <div
                                class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <UButton
                                    icon="i-heroicons-pencil"
                                    size="sm"
                                    variant="ghost"
                                    color="blue"
                                    @click="startEdit('agency', a)"
                                />
                                <UButton
                                    icon="i-heroicons-trash"
                                    size="sm"
                                    variant="ghost"
                                    color="red"
                                    @click="
                                        deleteItem(
                                            'agencies',
                                            a.id,
                                            refreshAgencies,
                                        )
                                    "
                                />
                            </div>
                        </template>
                    </li>
                </ul>
            </UCard>

            <!-- 4. สถานะโครงการ -->
            <UCard class="border-2 border-primary-100">
                <template #header
                    ><div
                        class="font-bold flex items-center gap-2 text-lg text-primary"
                    >
                        <UIcon name="i-heroicons-check-circle" />สถานะ
                    </div></template
                >
                <div class="space-y-3 mb-6 border-b pb-6">
                    <!-- บรรทัดเดียวสำหรับ ชื่อสถานะ, สี และ ปุ่มเพิ่ม -->
                    <div class="flex gap-2 items-center">
                        <UInput
                            v-model="newStatus.name"
                            placeholder="ชื่อสถานะ"
                            class="flex-[2]"
                            size="lg"
                        />
                        <select
                            v-model="newStatus.color"
                            class="flex-1 h-12 px-3 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                        >
                            <option
                                v-for="c in colorOptions"
                                :key="c.value"
                                :value="c.value"
                            >
                                {{ c.label }}
                            </option>
                        </select>
                        <UButton
                            label="เพิ่มสถานะ"
                            :loading="loading.status"
                            @click="addItem('status')"
                            size="lg"
                            class="px-6"
                        />
                    </div>
                    <p class="text-xs text-gray-400 italic font-medium">
                        * ลำดับจะถูกรันให้อัตโนมัติ
                    </p>
                </div>
                <ul
                    class="divide-y divide-gray-100 dark:divide-gray-800 max-h-80 overflow-y-auto pr-2"
                >
                    <li
                        v-for="s in statuses"
                        :key="s.id"
                        class="py-3 flex flex-col gap-3 group px-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    >
                        <template
                            v-if="
                                editMode.type === 'status' &&
                                editMode.id === s.id
                            "
                        >
                            <UInput
                                v-model="editValue.name"
                                placeholder="ชื่อสถานะ"
                            />
                            <div class="flex gap-2">
                                <select
                                    v-model="editValue.color"
                                    class="flex-1 h-9 px-2 rounded border text-sm"
                                >
                                    <option
                                        v-for="c in colorOptions"
                                        :key="c.value"
                                        :value="c.value"
                                    >
                                        {{ c.label }}
                                    </option>
                                </select>
                                <UInput
                                    v-model="editValue.order"
                                    type="number"
                                    class="w-20"
                                    placeholder="ลำดับ"
                                />
                                <UButton
                                    icon="i-heroicons-check"
                                    color="green"
                                    @click="saveEdit(refreshStatuses)"
                                />
                                <UButton
                                    icon="i-heroicons-x-mark"
                                    color="gray"
                                    @click="editMode = { type: '', id: null }"
                                />
                            </div>
                        </template>
                        <template v-else>
                            <div
                                class="flex justify-between items-center w-full"
                            >
                                <div class="flex items-center gap-4">
                                    <span
                                        class="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 text-sm font-bold text-gray-500 shadow-inner"
                                    >
                                        {{ s.order }}
                                    </span>
                                    <div
                                        :class="getBadgeClass(s.color)"
                                        class="px-4 py-1.5 text-base font-bold rounded-md shadow-sm"
                                    >
                                        {{ s.name }}
                                    </div>
                                </div>
                                <div
                                    class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <UButton
                                        icon="i-heroicons-pencil"
                                        size="sm"
                                        variant="ghost"
                                        color="blue"
                                        @click="startEdit('status', s)"
                                    />
                                    <UButton
                                        icon="i-heroicons-trash"
                                        size="sm"
                                        variant="ghost"
                                        color="red"
                                        @click="
                                            deleteItem(
                                                'statuses',
                                                s.id,
                                                refreshStatuses,
                                            )
                                        "
                                    />
                                </div>
                            </div>
                        </template>
                    </li>
                </ul>
            </UCard>

            <!-- 5. ผู้รับผิดชอบ (New) -->
            <UCard>
                <template #header><div
                        class="font-bold flex items-center gap-2 text-lg text-primary"
                    >
                        <UIcon name="i-heroicons-user-group" />ผู้รับผิดชอบ
                    </div></template
                >
                <div class="flex gap-2 mb-6 border-b pb-6">
                    <UInput
                        v-model="newResponsible.name"
                        placeholder="ระบุชื่อ-นามสกุล ผู้รับผิดชอบ"
                        size="lg"
                        class="flex-1"
                    />
                    <UButton
                        label="เพิ่มผู้รับผิดชอบ"
                        :loading="loading.responsible"
                        @click="addItem('responsible')"
                        size="lg"
                        class="px-8"
                    />
                </div>
                <ul
                    class="divide-y divide-gray-100 dark:divide-gray-800 max-h-96 overflow-y-auto pr-2"
                >
                    <li
                        v-for="r in responsiblePersons"
                        :key="r.id"
                        class="py-3 flex justify-between items-center group px-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    >
                        <template
                            v-if="
                                editMode.type === 'responsible' &&
                                editMode.id === r.id
                            "
                        >
                            <UInput v-model="editValue.name" placeholder="ชื่อ-นามสกุล" class="flex-1 mr-2" />
                            <div class="flex gap-1">
                                <UButton
                                    icon="i-heroicons-check"
                                    size="sm"
                                    color="green"
                                    @click="saveEdit(refreshResponsiblePersons)"
                                />
                                <UButton
                                    icon="i-heroicons-x-mark"
                                    size="sm"
                                    color="gray"
                                    @click="editMode = { type: '', id: null }"
                                />
                            </div>
                        </template>
                        <template v-else>
                            <span class="text-lg font-medium">{{ r.name }}</span>
                            <div
                                class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <UButton
                                    icon="i-heroicons-pencil"
                                    size="sm"
                                    variant="ghost"
                                    color="blue"
                                    @click="startEdit('responsible', r)"
                                />
                                <UButton
                                    icon="i-heroicons-trash"
                                    size="sm"
                                    variant="ghost"
                                    color="red"
                                    @click="
                                        deleteItem(
                                            'responsible-persons',
                                            r.id,
                                            refreshResponsiblePersons,
                                        )
                                    "
                                />
                            </div>
                        </template>
                    </li>
                </ul>
            </UCard>

            <!-- 7. แหล่งที่มางบประมาณ (New) -->
            <UCard>
                <template #header
                    ><div
                        class="font-bold flex items-center gap-2 text-lg text-primary"
                    >
                        <UIcon name="i-heroicons-banknotes" />แหล่งที่มาของงบประมาณ
                    </div></template
                >
                <div class="flex gap-2 mb-6">
                    <UInput
                        v-model="newBudgetSource"
                        placeholder="ระบุแหล่งที่มาของงบประมาณ"
                        class="flex-1"
                        size="lg"
                    />
                    <UButton
                        label="เพิ่ม"
                        :loading="loading.budgetSource"
                        @click="addItem('budgetSource')"
                        size="lg"
                    />
                </div>
                <ul
                    class="divide-y divide-gray-100 dark:divide-gray-800 max-h-80 overflow-y-auto pr-2"
                >
                    <li
                        v-for="bs in budgetSources"
                        :key="bs.id"
                        class="py-3 flex justify-between items-center group px-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    >
                        <template
                            v-if="
                                editMode.type === 'budgetSource' &&
                                editMode.id === bs.id
                            "
                        >
                            <UInput
                                v-model="editValue.name"
                                class="flex-1 mr-2"
                            />
                            <div class="flex gap-1">
                                <UButton
                                    icon="i-heroicons-check"
                                    size="sm"
                                    color="green"
                                    @click="saveEdit(refreshBudgetSources)"
                                />
                                <UButton
                                    icon="i-heroicons-x-mark"
                                    size="sm"
                                    color="gray"
                                    @click="editMode = { type: '', id: null }"
                                />
                            </div>
                        </template>
                        <template v-else>
                            <span class="text-lg font-medium">{{
                                bs.name
                            }}</span>
                            <div
                                class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <UButton
                                    icon="i-heroicons-pencil"
                                    size="sm"
                                    variant="ghost"
                                    color="blue"
                                    @click="startEdit('budgetSource', bs)"
                                />
                                <UButton
                                    icon="i-heroicons-trash"
                                    size="sm"
                                    variant="ghost"
                                    color="red"
                                    @click="
                                        deleteItem(
                                            'budget-sources',
                                            bs.id,
                                            refreshBudgetSources,
                                        )
                                    "
                                />
                            </div>
                        </template>
                    </li>
                </ul>
            </UCard>

            <!-- 6. ไตรมาส (Read-only) -->
            <UCard>
                <template #header
                    ><div
                        class="font-bold flex items-center gap-2 text-lg text-primary"
                    >
                        <UIcon name="i-heroicons-list-bullet" />ไตรมาส
                    </div></template
                >
                <ul class="divide-y divide-gray-100 dark:divide-gray-800 pr-2">
                    <li
                        v-for="q in quarters"
                        :key="q.id"
                        class="py-3 flex justify-between items-center px-2"
                    >
                        <span class="text-lg font-medium">{{ q.name }}</span>
                        <UIcon name="i-heroicons-lock-closed" class="text-gray-300" />
                    </li>
                </ul>
                <p class="text-[10px] text-gray-400 mt-4 italic text-center">
                    * ข้อมูลไตรมาสถูกกำหนดโดยระบบ ไม่สามารถแก้ไขได้
                </p>
            </UCard>
        </div>
    </div>
</template>
