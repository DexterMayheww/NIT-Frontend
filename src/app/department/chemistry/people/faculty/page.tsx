import DepartmentGenericPage from '@/components/DepartmentGenericPage';

export default async function Page() {
    return <DepartmentGenericPage path="/department/chemistry" mode="faculty" category="People" deptSlug="chemistry" deptName="Chemistry" />;
}
