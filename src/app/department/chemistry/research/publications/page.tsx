import DepartmentGenericPage from '@/components/DepartmentGenericPage';

export default async function Page() {
    return <DepartmentGenericPage path="/department/chemistry/publications" mode="generic" category="Research" deptSlug="chemistry" deptName="Chemistry" />;
}
