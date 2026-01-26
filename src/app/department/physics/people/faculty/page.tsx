import DepartmentGenericPage from '@/components/DepartmentGenericPage';

export default async function Page() {
    return <DepartmentGenericPage path="/department/physics" mode="faculty" category="People" deptSlug="physics" deptName="Physics" />;
}
