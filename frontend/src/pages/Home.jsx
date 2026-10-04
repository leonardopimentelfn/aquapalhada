import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import EditorialMarquee from "@/components/EditorialMarquee";
import CategoryBento from "@/components/CategoryBento";
import ProductGrid from "@/components/ProductGrid";
import Footer from "@/components/Footer";
import CartSheet from "@/components/CartSheet";
import { scrollToId } from "@/lib/scroll";
import api from "@/lib/api";

const Home = () => {
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState("todos");

  useEffect(() => {
    api
      .get("/products")
      .then(({ data }) => setProducts(data))
      .catch(() => {});
  }, []);

  const selectCategory = (key) => {
    setCategory(key);
    scrollToId("catalogo");
  };

  return (
    <main className="min-h-screen bg-navy">
      <Navbar />
      <Hero />
      <EditorialMarquee />
      <CategoryBento products={products} onSelect={selectCategory} />
      <ProductGrid products={products} category={category} setCategory={setCategory} />
      <Footer />
      <CartSheet />
    </main>
  );
};

export default Home;
