import { HeroSliderFromConfig } from "@/components/home/HeroSliderFromConfig";
import { QuickServicesFromConfig } from "@/components/home/QuickServicesFromConfig";
import { BannerGridFromConfig } from "@/components/home/BannerGridFromConfig";
import { Stories } from "@/components/home/Stories";
import {
    HomeSectionType,
    parseConfig,
    StoriesConfigSchema,
    HeroSliderConfigSchema,
    QuickServicesConfigSchema,
    AmazingProductsConfigSchema,
    BannerRowConfigSchema,
    FullWidthImageConfigSchema,
    CategoryIconsConfigSchema,
    CategoryProductsSliderConfigSchema,
} from "@/modules/home-template/types";
import type { PublicHomeLayout } from "@/modules/home-template/types";
import { AmazingSliderFromConfig } from "@/components/home/AmazingSliderFromConfig";
import { FullWidthImageFromConfig } from "@/components/home/FullWidthImageFromConfig";
import { CategoryIconsFromConfig } from "@/components/home/CategoryIconsFromConfig";
import { TopBrandsFromConfig } from "@/components/home/TopBrandsFromConfig";
import { CategoryProducts4ColumnFromConfig } from "@/components/home/CategoryProducts4ColumnFromConfig";
import { BestSellingProductsFromConfig } from "@/components/home/BestSellingProductsFromConfig";
import { CategoryProductsSliderFromConfig } from "@/components/home/CategoryProductsSliderFromConfig";

function Box({ boxed, children }: { boxed: boolean; children: React.ReactNode }) {
    return boxed ? <div className="w-full max-w-[1336px] mx-auto px-4 2xl:px-0">{children}</div> : <>{children}</>;
}

export function RenderHomeLayout({ layout }: { layout: PublicHomeLayout }) {
    return (
        <div className="space-y-4">
            {layout.sections.map((s, idx) => {
                const key = (s as any).id ? String((s as any).id) : `${s.type}-${idx}`;

                switch (s.type) {
                    case HomeSectionType.Stories: {
                        const cfg = parseConfig(StoriesConfigSchema, s.configJson, { boxed: true, take: 12, title: "استوری‌ها" });
                        return (
                            <Box key={key} boxed={cfg.boxed}>
                                <Stories take={cfg.take} title={cfg.title} />
                            </Box>
                        );
                    }

                    case HomeSectionType.HeroSlider: {
                        const cfg = parseConfig(HeroSliderConfigSchema, s.configJson, { boxed: true, title: "", items: [] });
                        return (
                            <Box key={key} boxed={cfg.boxed}>
                                <HeroSliderFromConfig items={cfg.items} />
                            </Box>
                        );
                    }

                    case HomeSectionType.QuickServices: {
                        const cfg = parseConfig(QuickServicesConfigSchema, s.configJson, { boxed: true, title: "", items: [] });
                        return (
                            <Box key={key} boxed={cfg.boxed}>
                                <QuickServicesFromConfig title={cfg.title} items={cfg.items} />
                            </Box>
                        );
                    }

                    case HomeSectionType.AmazingProducts: {
                        const cfg = parseConfig(AmazingProductsConfigSchema, s.configJson, { boxed: true, take: 20, title: "پیشنهاد شگفت‌انگیز", categoryId: null, startAtUtc: null, endAtUtc: null });
                        return (
                            <Box key={key} boxed={cfg.boxed}>
                                <AmazingSliderFromConfig configJson={s.configJson} take={cfg.take} categoryId={cfg.categoryId} />
                            </Box>
                        );
                    }

                    case HomeSectionType.BannerRow: {
                        const cfg = parseConfig(BannerRowConfigSchema, s.configJson, { boxed: true, columns: 4, gap: 12, items: [] });
                        return (
                            <Box key={key} boxed={cfg.boxed}>
                                <BannerGridFromConfig boxed={false} columns={cfg.columns} gap={cfg.gap} items={cfg.items} />
                            </Box>
                        );
                    }

                    case HomeSectionType.FullWidthImage: {
                        const cfg = parseConfig(FullWidthImageConfigSchema, s.configJson, { imageUrl: "", alt: "", href: "", fixedHeight: false, heightPx: 360 });
                        return (
                            <FullWidthImageFromConfig
                                key={key}
                                imageUrl={cfg.imageUrl}
                                alt={cfg.alt}
                                href={cfg.href}
                                fixedHeight={cfg.fixedHeight}
                                heightPx={cfg.heightPx}
                            />
                        );
                    }

                    case HomeSectionType.CategoryIcons: {
                        const cfg = parseConfig(CategoryIconsConfigSchema, s.configJson, { title: "خرید بر اساس دسته‌بندی", boxed: true, items: [], imageSize: 100 });
                        return (
                            <CategoryIconsFromConfig key={key} title={cfg.title} boxed={cfg.boxed} items={cfg.items} imageSize={cfg.imageSize} />
                        );
                    }

                    case HomeSectionType.TopBrands:
                        return <TopBrandsFromConfig key={key} configJson={s.configJson} />;

                    case HomeSectionType.CategoryProducts4Column:
                        return <CategoryProducts4ColumnFromConfig key={key} configJson={s.configJson} />;


                    case HomeSectionType.BestSellingProducts:
                        return <BestSellingProductsFromConfig key={s.id ?? `${s.type}-${idx}`} />;


                    case HomeSectionType.CategoryProductsSlider: {
                        const cfg = parseConfig(CategoryProductsSliderConfigSchema, s.configJson, {
                            boxed: true,
                            title: "محصولات منتخب",
                            take: 12,
                            categoryIds: [],
                            showAllHref: "",
                            showAllText: "نمایش همه",
                        });

                        return (
                            <Box key={key} boxed={cfg.boxed}>
                                <CategoryProductsSliderFromConfig configJson={s.configJson} />
                            </Box>
                        );
                    }

                    default:
                        return null;
                }
            })}

        </div>
    );
}
