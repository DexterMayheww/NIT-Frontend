import DepartmentGenericPage from '@/components/DepartmentGenericPage';

export default async function Page() {
    return <DepartmentGenericPage path="/department/physics/students" mode="students" category="People" deptSlug="physics" deptName="Physics" />;
}
