import DepartmentGenericPage from '@/components/DepartmentGenericPage';

export default async function Page() {
    return <DepartmentGenericPage path="/department/physics/lab-in-charge" mode="generic" category="People" deptSlug="physics" deptName="Physics" />;
}
