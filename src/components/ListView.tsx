import ProductCard, { CategoryType } from "./ProductCard";

interface Product {
  id: string;
  title: string;
  price: string;
  image: string;
  category: CategoryType;
  vendor: string;
}

interface ListViewProps {
  products: Product[];
}

const ListView = ({ products }: ListViewProps) => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col gap-6 max-w-4xl mx-auto">
        {products.map((product) => (
          <div key={product.id} className="flex gap-4 bg-card border border-border rounded-lg p-4 hover:shadow-lg transition-shadow">
            <div className="w-32 h-32 shrink-0">
              <img
                src={product.image}
                alt={product.title}
                className="w-full h-full object-cover rounded-md"
              />
            </div>
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-semibold text-foreground text-lg mb-1">{product.title}</h3>
                <p className="text-muted-foreground text-sm">{product.vendor}</p>
              </div>
              <p className="font-bold text-foreground text-xl">{product.price}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ListView;
