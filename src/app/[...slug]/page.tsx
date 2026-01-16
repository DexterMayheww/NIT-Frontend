// app/[...slug]/page.tsx
import DrupalPage from '@/components/DrupalPage';

export default async function Page({ params }: { params: Promise<{ slug: string[] }> }) {
    const { slug } = await params;
    return <DrupalPage slug={slug} />;
}

