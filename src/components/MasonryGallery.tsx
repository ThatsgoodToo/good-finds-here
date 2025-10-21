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
    <div className="container mx-auto px-4 py-8">
      <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-8 space-y-8">
        {products.map((product) => (
          <div key={product.id} className="break-inside-avoid mb-8">
            <ProductCard {...product} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default MasonryGallery;
