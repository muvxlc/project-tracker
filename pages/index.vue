<script setup lang="ts">
const { user } = useUser();

// Master data for filters
const { data: years } = await useFetch("/api/master/fiscal-years");
const { data: quartersMaster } = await useFetch("/api/master/quarters");
const { data: agencies } = await useFetch("/api/master/agencies");
const { data: categories } = await useFetch("/api/master/categories");
const { data: statuses } = await useFetch("/api/master/statuses");

const filters = ref({
    fiscalYearId: "",
    quarterId: "",
    agencyId: "",
    categoryId: "",
    statusId: "",
    search: "",
});

// Use useAsyncData to ensure stats are serialized correctly
const { data: stats, refresh: refreshStats } = await useAsyncData(
    "projects_stats",
    async () => {
        if (!user.value) return null;
        return await $fetch("/api/projects/stats", {
            params: {
                fiscalYearId: filters.value.fiscalYearId || undefined,
                quarterId: filters.value.quarterId || undefined,
                agencyId: filters.value.agencyId || undefined,
                categoryId: filters.value.categoryId || undefined,
                statusId: filters.value.statusId || undefined,
                search: filters.value.search || undefined,
            },
        });
    },
    {
        watch: [user, () => ({ ...filters.value })],
        server: true,
    },
);

// Fetch project list with filters
const { data: projects, refresh: refreshProjects } = await useAsyncData(
    "projects_list",
    async () => {
        if (!user.value) return [];
        return await $fetch("/api/projects", {
            params: {
                fiscalYearId: filters.value.fiscalYearId || undefined,
                quarterId: filters.value.quarterId || undefined,
                agencyId: filters.value.agencyId || undefined,
                categoryId: filters.value.categoryId || undefined,
                statusId: filters.value.statusId || undefined,
                search: filters.value.search || undefined,
            },
        });
    },
    {
        watch: [user, () => ({ ...filters.value })],
        server: true,
    },
);

const formatBudget = (val: string | number) => {
    return new Intl.NumberFormat("th-TH", {
        style: "currency",
        currency: "THB",
    }).format(Number(val));
};

// Export to Excel (Server-side)
const exportExcel = () => {
    const params = new URLSearchParams();
    if (filters.value.fiscalYearId) params.append('fiscalYearId', filters.value.fiscalYearId);
    if (filters.value.quarterId) params.append('quarterId', filters.value.quarterId);
    if (filters.value.agencyId) params.append('agencyId', filters.value.agencyId);
    if (filters.value.categoryId) params.append('categoryId', filters.value.categoryId);
    if (filters.value.statusId) params.append('statusId', filters.value.statusId);
    if (filters.value.search) params.append('search', filters.value.search);

    window.open(`/api/projects/export?${params.toString()}`, '_blank');
};

const totalProjectsCount = computed(() => projects.value?.length || 0);

const getStatusCount = (statusName: string) => {
    const status = stats.value?.statusStats.find(
        (s) => s.status === statusName,
    );
    return status ? status.count : 0;
};

const canEdit = (project: any) => {
    if (!user.value) return false;
    const adminRoles = ["superadmin", "admin", "approver"];
    if (adminRoles.includes(user.value.role)) return true;
    return project.createdById === user.value.id;
};

const canDelete = () => {
    if (!user.value) return false;
    return ["superadmin", "admin"].includes(user.value.role);
};

const deleteProject = async (id: number) => {
    if (
        !confirm(
            "คุณแน่ใจหรือไม่ว่าต้องการลบโครงการนี้? ข้อมูลไฟล์แนบทั้งหมดจะถูกลบออกด้วย",
        )
    )
        return;

    try {
        await $fetch(`/api/projects/${id}`, { method: "DELETE" });
        useToast().add({
            title: "สำเร็จ",
            description: "ลบโครงการเรียบร้อยแล้ว",
            color: "success",
        });
        await Promise.all([refreshProjects(), refreshStats()]);
    } catch (e: any) {
        useToast().add({
            title: "เกิดข้อผิดพลาด",
            description: "ไม่สามารถลบโครงการได้",
            color: "error",
        });
    }
};

const columns = [
    { accessorKey: "fiscalYear", header: "ปีงบฯ", class: "text-center" },
    { accessorKey: "quarterName", header: "ไตรมาส", class: "text-center" },
    { accessorKey: "category", header: "ประเภท", class: "text-center" },
    { accessorKey: "name", header: "ชื่อแผนงาน-โครงการ", class: "text-left" },
    {
        accessorKey: "responsible",
        header: "ผู้รับผิดชอบ",
        class: "text-center",
    },
    {
        accessorKey: "actualBudget",
        header: "งบฯ ที่ใช้จริง",
        class: "text-right",
    },
    { accessorKey: "status", header: "สถานะ", class: "text-center" },
    { accessorKey: "actions", header: "", class: "text-center" },
];

const colorMap: Record<string, string> = {
    blue: "bg-blue-600",
    green: "bg-green-600",
    yellow: "bg-yellow-500",
    red: "bg-red-600",
    orange: "bg-orange-500",
    purple: "bg-purple-600",
    pink: "bg-pink-600",
    gray: "bg-gray-600",
};

const borderMap: Record<string, string> = {
    blue: "border-l-blue-500",
    green: "border-l-green-500",
    yellow: "border-l-yellow-500",
    red: "border-l-red-500",
    orange: "border-l-orange-500",
    purple: "border-l-purple-500",
    pink: "border-l-pink-500",
    gray: "border-l-gray-500",
};

const bgMap: Record<string, string> = {
    blue: "bg-blue-100 dark:bg-blue-900/30",
    green: "bg-green-100 dark:bg-green-900/30",
    yellow: "bg-yellow-100 dark:bg-yellow-900/30",
    red: "bg-red-100 dark:bg-red-900/30",
    orange: "bg-orange-100 dark:bg-orange-900/30",
    purple: "bg-purple-100 dark:bg-purple-900/30",
    pink: "bg-pink-100 dark:bg-pink-900/30",
    gray: "bg-gray-100 dark:bg-gray-900/30",
};

const textMap: Record<string, string> = {
    blue: "text-blue-600",
    green: "text-green-600",
    yellow: "text-yellow-600",
    red: "text-red-600",
    orange: "text-orange-600",
    purple: "text-purple-600",
    pink: "text-pink-600",
    gray: "text-gray-600",
};

const iconMap: Record<string, string> = {
    รับเอกสาร: "i-heroicons-document-arrow-down",
    ตรวจสอบ: "i-heroicons-magnifying-glass-circle",
    อนุมัติ: "i-heroicons-check-badge",
    ดำเนินการ: "i-heroicons-play-circle",
    ดำเนินการเสร็จสิ้น: "i-heroicons-calendar-check",
    ยกเลิก: "i-heroicons-x-circle",
};
</script>

<template>
    <div class="space-y-12 font-thai">
        <!-- Authenticated Dashboard -->
        <div v-if="user" class="space-y-8">
            <div class="flex justify-between items-center">
                <h1 class="text-2xl font-bold">
                    แผงควบคุมติดตามแผนงาน โครงการ
                </h1>
                <div class="flex gap-2 print:hidden">
                    <UButton
                        icon="i-heroicons-document-arrow-down"
                        color="green"
                        variant="soft"
                        label="Excel"
                        @click="exportExcel"
                    />
                    <UButton
                        to="/projects/create"
                        icon="i-heroicons-plus"
                        label="เพิ่มแผนงาน-โครงการ"
                    />
                </div>
            </div>

            <!-- Dashboard Cards -->
            <ClientOnly>
                <div
                    v-if="stats"
                    class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 print:hidden"
                >
                    <!-- Total Card -->
                    <UCard class="border-l-4 border-l-blue-500 shadow-sm">
                        <div class="flex items-center gap-4">
                            <div
                                class="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full"
                            >
                                <UIcon
                                    name="i-heroicons-clipboard-document-list"
                                    class="w-6 h-6 text-blue-600"
                                />
                            </div>
                            <div>
                                <div
                                    class="text-sm text-gray-500 dark:text-gray-400 font-medium"
                                >
                                    จำนวนแผนงาน โครงการทั้งหมด
                                </div>
                                <div class="text-2xl font-bold">
                                    {{ totalProjectsCount }}
                                </div>
                            </div>
                        </div>
                    </UCard>

                    <!-- Dynamic Status Cards -->
                    <UCard
                        v-for="s in stats.statusStats"
                        :key="s.status"
                        :class="[
                            'border-l-4 shadow-sm',
                            borderMap[s.color] || 'border-l-gray-500',
                        ]"
                    >
                        <div class="flex items-center gap-4">
                            <div
                                :class="[
                                    'p-3 rounded-full',
                                    bgMap[s.color] ||
                                        'bg-gray-100 dark:bg-gray-900/30',
                                ]"
                            >
                                <UIcon
                                    :name="
                                        iconMap[s.status] ||
                                        'i-heroicons-document-text'
                                    "
                                    :class="[
                                        'w-6 h-6',
                                        textMap[s.color] || 'text-gray-600',
                                    ]"
                                />
                            </div>
                            <div>
                                <div
                                    class="text-sm text-gray-500 dark:text-gray-400 font-medium"
                                >
                                    {{ s.status }}
                                </div>
                                <div class="text-2xl font-bold">
                                    {{ s.count }}
                                </div>
                            </div>
                        </div>
                    </UCard>
                </div>
            </ClientOnly>

            <!-- Filters & Project List -->
            <UCard class="print:shadow-none print:border-none">
                <template #header>
                    <div
                        class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden"
                    >
                        <div class="font-bold text-lg">รายการทั้งหมด</div>

                        <div class="flex flex-wrap gap-2 w-full md:w-auto">
                            <!-- Search Input -->
                            <UInput
                                v-model="filters.search"
                                placeholder="ค้นหาชื่อโครงการ..."
                                icon="i-heroicons-magnifying-glass"
                                class="w-full md:w-64"
                            />

                            <ClientOnly>
                                <select
                                    v-model="filters.fiscalYearId"
                                    class="h-9 px-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-primary w-[110px] text-center"
                                >
                                    <option value="">ปีงบประมาณ</option>
                                    <option
                                        v-for="y in years as any[]"
                                        :key="y.id"
                                        :value="y.id"
                                    >
                                        {{ y.year }}
                                    </option>
                                </select>

                                <select
                                    v-model="filters.quarterId"
                                    class="h-9 px-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-primary w-[100px] text-center"
                                >
                                    <option value="">ไตรมาส</option>
                                    <option
                                        v-for="q in quartersMaster as any[]"
                                        :key="q.id"
                                        :value="q.id"
                                    >
                                        {{ q.name }}
                                    </option>
                                </select>

                                <select
                                    v-model="filters.agencyId"
                                    class="h-9 px-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-primary w-[130px] text-center"
                                >
                                    <option value="">กลุ่มงาน</option>
                                    <option
                                        v-for="a in agencies as any[]"
                                        :key="a.id"
                                        :value="a.id"
                                    >
                                        {{ a.name }}
                                    </option>
                                </select>

                                <select
                                    v-model="filters.categoryId"
                                    class="h-9 px-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-primary w-[120px] text-center"
                                >
                                    <option value="">ประเภท</option>
                                    <option
                                        v-for="c in categories as any[]"
                                        :key="c.id"
                                        :value="c.id"
                                    >
                                        {{ c.name }}
                                    </option>
                                </select>

                                <select
                                    v-model="filters.statusId"
                                    class="h-9 px-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-primary w-[110px] text-center"
                                >
                                    <option value="">สถานะ</option>
                                    <option
                                        v-for="s in statuses as any[]"
                                        :key="s.id"
                                        :value="s.id"
                                    >
                                        {{ s.name }}
                                    </option>
                                </select>
                            </ClientOnly>

                            <UButton
                                variant="ghost"
                                icon="i-heroicons-arrow-path"
                                color="gray"
                                @click="
                                    filters = {
                                        fiscalYearId: '',
                                        quarterId: '',
                                        agencyId: '',
                                        categoryId: '',
                                        statusId: '',
                                        search: '',
                                    }
                                "
                            />
                        </div>
                    </div>
                </template>

                <ClientOnly>
                    <UTable
                        :data="projects || []"
                        :columns="columns"
                        class="w-full"
                        :ui="{
                            th: {
                                base: 'text-center !text-center justify-center',
                            },
                            td: { base: 'text-center' },
                        }"
                    >
                        <template #fiscalYear-cell="{ row }">
                            <div class="text-center">
                                {{ row.original.fiscalYear }}
                            </div>
                        </template>

                        <template #quarterName-cell="{ row }">
                            <div class="text-center">
                                {{ row.original.quarterName }}
                            </div>
                        </template>

                        <template #category-cell="{ row }">
                            <div class="text-center text-sm">
                                {{ row.original.category }}
                            </div>
                        </template>

                        <template #actualBudget-cell="{ row }">
                            <span class="font-medium text-right block text-sm px-2">
                                {{
                                    formatBudget(
                                        row.original.actualBudget ||
                                            row.original.budget ||
                                            0,
                                    )
                                }}
                            </span>
                        </template>

                        <template #name-cell="{ row }">
                            <div class="min-w-[250px] max-w-[450px] text-left">
                                <div
                                    class="break-words whitespace-normal leading-relaxed py-1"
                                >
                                    {{ row.original.name }}
                                </div>
                            </div>
                        </template>

                        <template #status-cell="{ row }">
                            <div class="flex justify-center">
                                <div
                                    :class="[
                                        colorMap[row.original.statusColor] ||
                                            'bg-blue-600',
                                        'px-2 py-0.5 rounded text-[10px] text-white font-bold inline-block whitespace-nowrap',
                                    ]"
                                >
                                    {{ row.original.status }}
                                </div>
                            </div>
                        </template>

                        <template #actions-cell="{ row }">
                            <div class="flex gap-1 justify-center print:hidden">
                                <UButton
                                    v-if="canEdit(row.original)"
                                    icon="i-heroicons-pencil-square"
                                    size="xs"
                                    color="blue"
                                    variant="ghost"
                                    label="แก้ไข"
                                    :to="`/projects/${row.original.id}/edit`"
                                />
                                <UButton
                                    v-if="canDelete()"
                                    icon="i-heroicons-trash"
                                    size="xs"
                                    color="red"
                                    variant="ghost"
                                    label="ลบ"
                                    @click="deleteProject(row.original.id)"
                                />
                            </div>
                        </template>
                    </UTable>

                    <div
                        v-if="!projects?.length"
                        class="text-center py-12 text-gray-400"
                    >
                        ไม่พบข้อมูลตามเงื่อนไขที่ระบุ
                    </div>
                </ClientOnly>
            </UCard>

            <!-- Budget Summary Cards -->
            <ClientOnly>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 print:hidden">
                    <!-- Initial Budget Card -->
                    <UCard
                        class="bg-blue-600 text-white border-none shadow-md overflow-hidden relative"
                    >
                        <div
                            class="relative z-10 flex justify-between items-center px-4 py-2"
                        >
                            <div>
                                <div
                                    class="text-sm text-blue-100 font-bold uppercase tracking-wider opacity-90"
                                >
                                    งบประมาณตั้งต้นรวม
                                </div>
                                <div class="text-4xl font-black mt-1">
                                    {{
                                        formatBudget(
                                            projects?.reduce(
                                                (acc, curr) =>
                                                    acc +
                                                    Number(
                                                        curr.initialBudget ||
                                                            curr.budget ||
                                                            0,
                                                    ),
                                                0,
                                            ) || 0,
                                        )
                                    }}
                                </div>
                            </div>
                            <UIcon
                                name="i-heroicons-banknotes"
                                class="w-16 h-16 text-white/20"
                            />
                        </div>
                    </UCard>

                    <!-- Actual Budget Card -->
                    <UCard
                        class="bg-green-600 text-white border-none shadow-md overflow-hidden relative"
                    >
                        <div
                            class="relative z-10 flex justify-between items-center px-4 py-4"
                        >
                            <div>
                                <div
                                    class="text-sm text-green-100 font-bold uppercase tracking-wider opacity-90"
                                >
                                    งบประมาณที่ใช้จริงรวม
                                </div>
                                <div class="text-4xl font-black mt-1">
                                    {{
                                        formatBudget(
                                            projects?.reduce(
                                                (acc, curr) =>
                                                    acc +
                                                    Number(
                                                        curr.actualBudget || 0,
                                                    ),
                                                0,
                                            ) || 0,
                                        )
                                    }}
                                </div>
                            </div>
                            <UIcon
                                name="i-heroicons-check-circle"
                                class="w-16 h-16 text-white/20"
                            />
                        </div>
                    </UCard>
                </div>
            </ClientOnly>
        </div>

        <!-- Public Landing Page -->
        <div v-else class="space-y-12">
            <section class="text-center py-12">
                <h2 class="text-4xl font-extrabold sm:text-6xl text-blue-600">
                    ระบบติดตามแผนงาน โครงการ
                </h2>
                <p class="mt-4 text-xl text-gray-500 max-w-2xl mx-auto italic">
                    บริหารจัดการและติดตามสถานะแผนงาน โครงการ งบประมาณ
                    และการดำเนินงาน อย่างมีประสิทธิภาพ
                </p>
                <div class="mt-8 flex justify-center gap-4">
                    <UButton
                        size="xl"
                        label="เข้าสู่ระบบเพื่อเริ่มต้น"
                        icon="i-heroicons-arrow-right"
                        to="/login"
                    />
                </div>
            </section>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                <UCard
                    class="hover:border-blue-500 transition-colors shadow-sm text-center"
                >
                    <template #header>
                        <div class="flex flex-col items-center gap-2">
                            <UIcon
                                name="i-heroicons-shield-check"
                                class="text-blue-500 w-10 h-10"
                            />
                            <span
                                class="font-bold text-lg text-gray-900 dark:text-white"
                            ></span>
                        </div>
                    </template>
                    รองรับการจัดการสิทธิ์ (RBAC) และการเข้าใช้งานผ่าน ThaiID
                    ของกรมการปกครอง
                </UCard>
                <UCard
                    class="hover:border-blue-500 transition-colors shadow-sm text-center"
                >
                    <template #header>
                        <div class="flex flex-col items-center gap-2">
                            <UIcon
                                name="i-heroicons-banknotes"
                                class="text-blue-500 w-10 h-10"
                            />
                            <span
                                class="font-bold text-lg text-gray-900 dark:text-white"
                                >ติดตามงบประมาณ</span
                            >
                        </div>
                    </template>
                    ตรวจสอบการใช้งบประมาณและสถานะการดำเนินงานในแต่ละขั้นตอนแบบ
                    Real-time
                </UCard>
                <UCard
                    class="hover:border-blue-500 transition-colors shadow-sm text-center"
                >
                    <template #header>
                        <div class="flex flex-col items-center gap-2">
                            <UIcon
                                name="i-heroicons-bell"
                                class="text-blue-500 w-10 h-10"
                            />
                            <span
                                class="font-bold text-lg text-gray-900 dark:text-white"
                                >ระบบแจ้งเตือน</span
                            >
                        </div>
                    </template>
                    แจ้งเตือนผ่าน Line, Telegram และ Discord
                    ทันทีเมื่อมีการอัปเดตสถานะโครงการ
                </UCard>
            </div>
        </div>
    </div>
</template>

<style scoped>
:deep(th) {
    text-align: center !important;
}
:deep(th > *) {
    justify-content: center !important;
    text-align: center !important;
}

@media print {
    @page {
        size: A4 landscape;
        margin: 1cm;
    }
    body {
        background-color: white !important;
        color: black !important;
    }
    .space-y-12, .space-y-8 {
        margin: 0 !important;
        padding: 0 !important;
        gap: 0 !important;
    }
    :deep(table) {
        border-collapse: collapse !important;
        width: 100% !important;
        table-layout: auto !important;
    }
    :deep(th), :deep(td) {
        border: 1px solid #ddd !important;
        padding: 8px !important;
        color: black !important;
        font-size: 11pt !important;
    }
    :deep(th) {
        background-color: #f8f9fa !important;
    }
    .print\:hidden {
        display: none !important;
    }
}
</style>
