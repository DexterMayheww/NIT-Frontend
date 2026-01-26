import DepartmentGenericPage from '@/components/DepartmentGenericPage';

export default async function Page() {
    return <DepartmentGenericPage path="/department/chemistry/projects" mode="generic" category="Research" deptSlug="chemistry" deptName="Chemistry" />;
}
