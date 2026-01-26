import DepartmentGenericPage from '@/components/DepartmentGenericPage';

export default async function Page() {
    return <DepartmentGenericPage path="/department/chemistry/consultancies" mode="generic" category="Research" deptSlug="chemistry" deptName="Chemistry" />;
}
