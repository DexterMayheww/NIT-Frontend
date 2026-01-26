import DepartmentGenericPage from '@/components/DepartmentGenericPage';

export default async function Page() {
    return <DepartmentGenericPage path="/department/chemistry/lab-in-charge" mode="generic" category="People" deptSlug="chemistry" deptName="Chemistry" />;
}
