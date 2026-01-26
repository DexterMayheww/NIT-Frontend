import DepartmentGenericPage from '@/components/DepartmentGenericPage';

export default async function Page() {
    return <DepartmentGenericPage path="/department/chemistry/syllabus" mode="generic" category="Academics" deptSlug="chemistry" deptName="Chemistry" />;
}
