import DepartmentGenericPage from '@/components/DepartmentGenericPage';

export default async function Page() {
    return <DepartmentGenericPage path="/department/mathematics/time-table" mode="generic" category="Academics" deptSlug="mathematics" deptName="Mathematics" />;
}
