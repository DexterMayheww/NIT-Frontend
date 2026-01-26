import DepartmentGenericPage from '@/components/DepartmentGenericPage';

export default async function Page() {
    return <DepartmentGenericPage path="/department/physics/consultancies" mode="generic" category="Research" deptSlug="physics" deptName="Physics" />;
}
