import ProductCard, { CategoryType } from "./ProductCard";

interface Product {
  id: string;
  title: string;
  price: string;
  image: string;
  categories: CategoryType[];
  vendor: string;
  vendorId: string;
}

interface MasonryGalleryProps {
  products: Product[];
}

const MasonryGallery = ({ products }: MasonryGalleryProps) => {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="columns-2 lg:columns-3 xl:columns-4 gap-32 space-y-32">
        {products.map((product) => (
          <div key={product.id} className="break-inside-avoid mb-32">
            <ProductCard {...product} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default MasonryGallery;
