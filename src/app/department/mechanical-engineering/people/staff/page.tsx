import DepartmentGenericPage from '@/components/DepartmentGenericPage';

export default async function Page() {
    return <DepartmentGenericPage path="/department/mechanical-engineering" mode="staff" category="People" deptSlug="mechanical-engineering" deptName="Mechanical Engineering" />;
}
