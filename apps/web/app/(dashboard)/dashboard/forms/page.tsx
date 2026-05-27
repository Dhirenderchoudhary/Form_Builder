import { FormsList } from "@/app/(dashboard)/_components/forms-list";

export const metadata = {
  title: "Mission Scrolls — Konoha",
};

export default function FormsPage() {
  return (
    <div>
      {/* Hero band */}
      <section className="mb-8">
        <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.4em] text-konoha-orange">
          Forms · 巻物
        </p>
        <h1 className="font-heading text-3xl font-black tracking-tight md:text-4xl">
          Mission Scroll Archive
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
          Every scroll you&apos;ve forged. Sort, search, deploy across the village,
          or seal it away when its mission is complete.
        </p>
      </section>

      <FormsList full />
    </div>
  );
}
