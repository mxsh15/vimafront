import { getBrand } from "@/modules/brand/api";
import { upsertBrandAction } from "@/modules/brand/actions";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { BrandForm } from "@/modules/brand/ui/BrandForm";

export default async function Page({ params }: { params: { id: string } }) {
  const item = await getBrand(params.id);
  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle={`Edit: ${item.title}`} />
      <ComponentCard title="Brand">
        <BrandForm
          submitLabel="ذخیره"
          defaultValues={{ ...item }}
          onSubmit={async (v) => {
            "use server";
            await upsertBrandAction(item.id, v);
          }}
        />
      </ComponentCard>
    </div>
  );
}
