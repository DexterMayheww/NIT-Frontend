import DepartmentGenericPage from '@/components/DepartmentGenericPage';

export default async function Page() {
    return <DepartmentGenericPage path="/department/chemistry/time-table" mode="generic" category="Academics" deptSlug="chemistry" deptName="Chemistry" />;
}
