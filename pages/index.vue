<script setup lang="ts">
const { user } = useUser();

// Master data for filters
const { data: years } = await useFetch("/api/master/fiscal-years");
const { data: agencies } = await useFetch("/api/master/agencies");
const { data: categories } = await useFetch("/api/master/categories");
const { data: statuses } = await useFetch("/api/master/statuses");

const filters = ref({
    fiscalYearId: "",
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

const columns = [
    { accessorKey: "fiscalYear", header: "ปีงบฯ" },
    { accessorKey: "quarterName", header: "ไตรมาส" },
    { accessorKey: "category", header: "ประเภท" },
    { accessorKey: "name", header: "ชื่อแผนงาน-โครงการ" },
    { accessorKey: "agency", header: "กลุ่มงาน" },
    { accessorKey: "responsible", header: "ผู้รับผิดชอบ" },
    { accessorKey: "budget", header: "งบประมาณ" },
    { accessorKey: "status", header: "สถานะ" },
    { accessorKey: "actions", header: "" },
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
                <div class="flex gap-2">
                    <UButton
                        to="/projects/create"
                        icon="i-heroicons-plus"
                        label="เพิ่มแผนงาน-โครงการ"
                    />
                </div>
            </div>

            <!-- Dashboard Cards -->
            <div
                v-if="stats"
                class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
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
                            <div class="text-2xl font-bold">{{ s.count }}</div>
                        </div>
                    </div>
                </UCard>
            </div>

            <!-- Filters & Project List -->
            <UCard>
                <template #header>
                    <div
                        class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
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

                            <select
                                v-model="filters.fiscalYearId"
                                class="h-9 px-3 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-primary"
                            >
                                <option value="">ทุกปีงบประมาณ</option>
                                <option
                                    v-for="y in years as any[]"
                                    :key="y.id"
                                    :value="y.id"
                                >
                                    {{ y.year }}
                                </option>
                            </select>

                            <select
                                v-model="filters.agencyId"
                                class="h-9 px-3 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-primary"
                            >
                                <option value="">ทุกกลุ่มงาน</option>
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
                                class="h-9 px-3 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-primary"
                            >
                                <option value="">ทุกประเภท</option>
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
                                class="h-9 px-3 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-primary"
                            >
                                <option value="">ทุกสถานะ</option>
                                <option
                                    v-for="s in statuses as any[]"
                                    :key="s.id"
                                    :value="s.id"
                                >
                                    {{ s.name }}
                                </option>
                            </select>

                            <UButton
                                variant="ghost"
                                icon="i-heroicons-arrow-path"
                                color="gray"
                                @click="
                                    filters = {
                                        fiscalYearId: '',
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

                <UTable
                    :data="projects || []"
                    :columns="columns"
                    class="w-full"
                >
                    <template #budget-cell="{ row }">
                        <span class="font-medium">{{
                            formatBudget(row.original.budget)
                        }}</span>
                    </template>

                    <template #status-cell="{ row }">
                        <div
                            :class="[
                                colorMap[row.original.statusColor] ||
                                    'bg-blue-600',
                                'px-2 py-0.5 rounded text-[10px] text-white font-bold inline-block whitespace-nowrap',
                            ]"
                        >
                            {{ row.original.status }}
                        </div>
                    </template>

                    <template #actions-cell="{ row }">
                        <UButton
                            v-if="canEdit(row.original)"
                            icon="i-heroicons-pencil-square"
                            size="xs"
                            color="blue"
                            variant="ghost"
                            label="แก้ไข"
                            :to="`/projects/${row.original.id}/edit`"
                        />
                    </template>
                </UTable>

                <div
                    v-if="!projects?.length"
                    class="text-center py-12 text-gray-400"
                >
                    ไม่พบข้อมูลตามเงื่อนไขที่ระบุ
                </div>
            </UCard>

            <!-- Overall Budget (Summary Footer) -->
            <UCard
                class="bg-blue-600 text-white border-none shadow-md overflow-hidden relative"
            >
                <div
                    class="relative z-10 flex justify-between items-center px-4"
                >
                    <div>
                        <div
                            class="text-sm text-blue-100 font-bold uppercase tracking-wider"
                        >
                            งบประมาณรวมจากโครงการที่แสดง
                        </div>
                        <div class="text-3xl font-black mt-1">
                            {{
                                formatBudget(
                                    projects?.reduce(
                                        (acc, curr) =>
                                            acc + Number(curr.budget),
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
                                >ความปลอดภัยสูง</span
                            >
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
