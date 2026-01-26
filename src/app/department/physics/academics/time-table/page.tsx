import DepartmentGenericPage from '@/components/DepartmentGenericPage';

export default async function Page() {
    return <DepartmentGenericPage path="/department/physics/time-table" mode="generic" category="Academics" deptSlug="physics" deptName="Physics" />;
}
