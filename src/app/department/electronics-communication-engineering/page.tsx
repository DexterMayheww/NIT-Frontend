import DrupalPage from '@/components/DrupalPage';

export default async function Page() {
    return <DrupalPage slug={['department', 'electronics-communication-engineering']} />;
}
