import DepartmentGenericPage from '@/components/DepartmentGenericPage';

export default async function Page() {
    return <DepartmentGenericPage path="/department/mathematics/publications" mode="generic" category="Research" deptSlug="mathematics" deptName="Mathematics" />;
}
