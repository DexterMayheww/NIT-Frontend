import DepartmentGenericPage from '@/components/DepartmentGenericPage';

export default async function Page() {
    return <DepartmentGenericPage path="/department/mathematics/projects" mode="generic" category="Research" deptSlug="mathematics" deptName="Mathematics" />;
}
