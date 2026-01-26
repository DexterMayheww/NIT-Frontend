import DepartmentGenericPage from '@/components/DepartmentGenericPage';

export default async function Page() {
    return <DepartmentGenericPage path="/department/chemistry/course-structure" mode="generic" category="Academics" deptSlug="chemistry" deptName="Chemistry" />;
}
