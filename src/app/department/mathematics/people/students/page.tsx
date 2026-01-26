import DepartmentGenericPage from '@/components/DepartmentGenericPage';

export default async function Page() {
    return <DepartmentGenericPage path="/department/mathematics/students" mode="students" category="People" deptSlug="mathematics" deptName="Mathematics" />;
}
