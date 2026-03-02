import { Product } from "@/types";

export function ProductDescription({ product }: { product: Product }) {
    if (!product.description) return null;

    return (
        <div className="w-full pt-4 pb-12 lg:py-24 bg-white border-t border-gray-100">
            <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-24">
                    {/* Left: Sticky Header */}
                    <div className="lg:col-span-4">
                        <div className="lg:sticky lg:top-32">
                            <h3 className="font-serif text-3xl text-gray-900 mb-4">Product Detail</h3>
                            <div className="w-12 h-0.5 bg-black/10"></div>
                        </div>
                    </div>

                    {/* Right: Content */}
                    <div className="lg:col-span-6 lg:col-start-6">
                        <div
                            className="text-gray-800 leading-relaxed font-light text-base lg:text-lg
                            [&_p]:mb-6 [&_p]:leading-loose
                            [&_h1]:text-2xl [&_h1]:font-normal [&_h1]:font-serif [&_h1]:mb-6 [&_h1]:mt-8
                            [&_h2]:text-xl [&_h2]:font-medium [&_h2]:mb-4 [&_h2]:mt-8
                            [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-6 [&_ul]:space-y-2
                            [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-6 [&_ol]:space-y-2
                            [&_a]:text-black [&_a]:underline [&_a]:underline-offset-4
                            [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-sm [&_img]:mb-8"
                            dangerouslySetInnerHTML={{ __html: product.description }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
