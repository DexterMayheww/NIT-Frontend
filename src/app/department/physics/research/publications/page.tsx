import DepartmentGenericPage from '@/components/DepartmentGenericPage';

export default async function Page() {
    return <DepartmentGenericPage path="/department/physics/publications" mode="generic" category="Research" deptSlug="physics" deptName="Physics" />;
}
