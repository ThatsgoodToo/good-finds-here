import { CategoryType } from "./ProductCard";
import { Link } from "react-router-dom";

interface Product {
  id: string;
  title: string;
  price: string;
  image: string;
  categories: CategoryType[];
  vendor: string;
  vendorId: string;
}

interface ListViewProps {
  products: Product[];
}

const ListView = ({ products }: ListViewProps) => {
  const getListingPath = (categories: CategoryType[], id: string) => {
    if (categories.includes("service") || categories.includes("experience")) {
      return `/listing/video/${id}`;
    }
    return `/listing/product/${id}`;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col gap-6 max-w-4xl mx-auto">
        {products.map((product) => (
          <Link 
            key={product.id} 
            to={getListingPath(product.categories, product.id)}
            className="flex gap-4 bg-card border border-border rounded-lg p-4 hover:shadow-lg transition-shadow"
          >
            <div className="w-32 h-32 shrink-0 relative">
              {/* Category Dots */}
              <div className="absolute top-2 left-2 z-10 flex gap-1.5">
                {product.categories.map((cat, index) => (
                  <div 
                    key={`${cat}-${index}`}
                    className={`w-3 h-3 rounded-full ring-2 ring-[#1a1a1a] ${
                      cat === 'product' ? 'bg-category-product' :
                      cat === 'service' ? 'bg-category-service' :
                      cat === 'experience' ? 'bg-category-experience' :
                      'bg-category-sale'
                    }`}
                  />
                ))}
              </div>
              <img
                src={product.image}
                alt={product.title}
                className="w-full h-full object-cover rounded-md"
              />
            </div>
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-semibold text-foreground text-lg mb-1">{product.title}</h3>
                <Link 
                  to={`/vendor/${product.vendorId}`}
                  onClick={(e) => e.stopPropagation()}
                  className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                >
                  {product.vendor}
                </Link>
              </div>
              <p className="font-bold text-foreground text-xl">{product.price}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ListView;
