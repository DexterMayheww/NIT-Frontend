import DepartmentGenericPage from '@/components/DepartmentGenericPage';

export default async function Page() {
    return <DepartmentGenericPage path="/department/computer-science-engineering/students" mode="students" category="People" deptSlug="computer-science-engineering" deptName="Computer Science and Engineering" />;
}
