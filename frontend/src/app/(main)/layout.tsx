import { SiteHeader } from '@/components/layout/site-header/site-header';
import { Footer } from '@/components/layout/footer/footer';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main>{children}</main>
      <Footer />
    </>
  );
}
