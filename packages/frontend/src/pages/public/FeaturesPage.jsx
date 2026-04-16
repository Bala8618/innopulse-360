import DashboardHero from '../../components/marketing/DashboardHero';
import Features from '../../components/marketing/Features';

export default function FeaturesPage() {
  return (
    <section className="space-y-12">
      <DashboardHero />
      <div className="border-t border-slate-200/80 pt-10">
        <Features />
      </div>
    </section>
  );
}
