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
        <div className="mx-auto max-w-main px-4 2xl:px-0 py-2 text-xs">
            <div className="items-center flex flex-wrap lg:mb-5 lg:px-5">
                <nav className="py-2 px-5 lg:px-0 grow min-w-0">
                    <BreadcrumbScroller items={items} />
                </nav>
            </div>
        </div>
    );
}
