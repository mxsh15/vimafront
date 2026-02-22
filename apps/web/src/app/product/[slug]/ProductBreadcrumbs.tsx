import { BreadcrumbScroller } from "@/components/common/BreadcrumbScroller";

export type BreadcrumbItem = {
    title: string;
    href: string | null;
};

type ProductBreadcrumbsProps = {
    items: BreadcrumbItem[];
};

export default function ProductBreadcrumbs({ items }: ProductBreadcrumbsProps) {
    return (
        <div className="items-center flex flex-wrap lg:mb-5">
            <nav className="py-2 px-5 lg:px-0 grow min-w-0">
                <BreadcrumbScroller items={items} />
            </nav>
        </div>
    );
}
