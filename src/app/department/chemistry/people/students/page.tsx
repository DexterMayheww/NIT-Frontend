import DepartmentGenericPage from '@/components/DepartmentGenericPage';

export default async function Page() {
    return <DepartmentGenericPage path="/department/chemistry/students" mode="students" category="People" deptSlug="chemistry" deptName="Chemistry" />;
}
