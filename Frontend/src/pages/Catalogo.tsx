import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Layout from "@/components/layout/Layout";
import AnimatedSection from "@/components/ui/AnimatedSection";
import { useCart } from "@/contexts/CartContext";
import { ChevronLeft, ChevronRight, ShoppingBag } from "lucide-react";
import { supabaseStoreService, type Produto } from "@/services/supabaseStoreService";

type Category = { id: string; label: string };

const normalizeCategory = (value?: string | null) =>
  (value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();

const FIXED_CATEGORIES: Category[] = [
  { id: "todas", label: "Todas" },
  { id: "new-in", label: "New In" },
  { id: "colecao-verao", label: "Coleção Verão" },
  { id: "colecao-icons", label: "Coleção Icons" },
  { id: "basic-tela", label: "Basic Tela" },
];

type CollectionKey = "basic-tela" | "colecao-icons" | "colecao-verao" | "new-in" | "todas";
type CatalogProduct = Produto & { groupId: string };
type ProductSize = "P" | "M" | "G";

const getProductImages = (product: Pick<Produto, "imagensUrls" | "imagemUrl">) =>
  product.imagensUrls && product.imagensUrls.length > 0
    ? product.imagensUrls
    : [product.imagemUrl].filter(Boolean);

const decodeUrlSegment = (value: string) => {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

const getImageFileBaseName = (url: string) => {
  const withoutQuery = url.split("?")[0] || "";
  const lastSegment = withoutQuery.split("/").pop() || "";
  const decoded = decodeUrlSegment(lastSegment).trim();
  return decoded.replace(/\.[a-zA-Z0-9]+$/, "");
};

const getImageGroupKey = (url?: string) => {
  if (!url) {
    return "";
  }

  const baseName = getImageFileBaseName(url);
  return baseName.replace(/-\d+$/, "").trim().toLowerCase();
};

const getImageVariantOrder = (url: string) => {
  const baseName = getImageFileBaseName(url);
  const match = baseName.match(/-(\d+)$/);
  if (!match) {
    return 0;
  }

  const parsed = Number(match[1]);
  return Number.isFinite(parsed) ? parsed : 0;
};

const getCollectionKey = (categoria?: string | null): CollectionKey => {
  const normalized = normalizeCategory(categoria);

  if (
    normalized === "basic tela" ||
    normalized === "basic_tela" ||
    (normalized.includes("basic") && normalized.includes("tela"))
  ) {
    return "basic-tela";
  }

  if (
    normalized === "colecao icons" ||
    normalized === "icons" ||
    normalized.includes("icon")
  ) {
    return "colecao-icons";
  }

  if (
    normalized === "colecao verao" ||
    normalized === "verao" ||
    normalized.includes("verao")
  ) {
    return "colecao-verao";
  }

  if (
    normalized === "new in" ||
    normalized === "newin" ||
    (normalized.includes("new") && normalized.includes("in"))
  ) {
    return "new-in";
  }

  return "todas";
};

const Catalogo = () => {
  const [activeCategory, setActiveCategory] = useState("basic-tela");
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<ProductSize | null>(null);
  const [products, setProducts] = useState<Produto[]>([]);
  const [cardImageIndexes, setCardImageIndexes] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const response = await supabaseStoreService.listarProdutos({ page: 0, size: 200 });
        setProducts(response.content);
      } catch (error) {
        console.error("Erro ao carregar catálogo:", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  const categories: Category[] = useMemo(() => FIXED_CATEGORIES, []);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => getCollectionKey(product.categoria) === activeCategory);
  }, [activeCategory, products]);

  const groupedProducts = useMemo<CatalogProduct[]>(() => {
    const grouped = new Map<string, CatalogProduct>();

    for (const product of filteredProducts) {
      const productImages = getProductImages(product);
      const imageGroupKey = getImageGroupKey(productImages[0]);
      const groupId = imageGroupKey || product.id;
      const current = grouped.get(groupId);

      if (!current) {
        grouped.set(groupId, {
          ...product,
          groupId,
          imagensUrls: [...new Set(productImages)],
          imagemUrl: productImages[0] || product.imagemUrl,
        });
        continue;
      }

      const mergedImages = [...new Set([...getProductImages(current), ...productImages])].sort(
        (a, b) => getImageVariantOrder(a) - getImageVariantOrder(b),
      );

      const currentMainOrder = getImageVariantOrder(getProductImages(current)[0] || "");
      const nextMainOrder = getImageVariantOrder(productImages[0] || "");
      const shouldUseCurrentAsMain = currentMainOrder <= nextMainOrder;

      if (shouldUseCurrentAsMain) {
        grouped.set(groupId, {
          ...current,
          imagensUrls: mergedImages,
          imagemUrl: mergedImages[0] || current.imagemUrl,
        });
      } else {
        grouped.set(groupId, {
          ...product,
          groupId,
          imagensUrls: mergedImages,
          imagemUrl: mergedImages[0] || product.imagemUrl,
        });
      }
    }

    return Array.from(grouped.values());
  }, [filteredProducts]);

  const selected = groupedProducts.find((product) => product.groupId === selectedProduct) || null;

  const getCardImageIndex = (product: CatalogProduct) => {
    const images = getProductImages(product);
    if (!images.length) {
      return 0;
    }

    const current = cardImageIndexes[product.groupId] || 0;
    return ((current % images.length) + images.length) % images.length;
  };

  const changeCardImage = (product: CatalogProduct, direction: "prev" | "next") => {
    const images = getProductImages(product);
    if (images.length <= 1) {
      return;
    }

    setCardImageIndexes((prev) => {
      const current = prev[product.groupId] || 0;
      const nextIndex = direction === "next" ? current + 1 : current - 1;
      return {
        ...prev,
        [product.groupId]: ((nextIndex % images.length) + images.length) % images.length,
      };
    });
  };

  const changeSelectedImage = (direction: "prev" | "next") => {
    if (!selected) {
      return;
    }

    const images = getProductImages(selected);
    if (images.length <= 1) {
      return;
    }

    setSelectedImageIndex((prev) => {
      const nextIndex = direction === "next" ? prev + 1 : prev - 1;
      return ((nextIndex % images.length) + images.length) % images.length;
    });
  };

  const formatPrice = (value: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value || 0);

  const imageTransition = { duration: 0.16, ease: [0.25, 0.46, 0.45, 0.94] as const };

  return (
    <Layout>
      <section className="pt-32 pb-16 lg:pt-40 lg:pb-24 bg-background">
        <div className="container mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="text-center max-w-2xl mx-auto"
          >
            <h1 className="display-heading text-foreground mb-6">Menu</h1>
            <p className="font-body text-lg text-muted-foreground">
              Confira o catálogo da nossa Loja
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-8 border-y border-border">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="flex flex-wrap justify-center gap-4 lg:gap-8">
            {categories.map((category) => (
              <motion.button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`font-body text-sm tracking-widest uppercase transition-all duration-300 pb-1 ${
                  activeCategory === category.id
                    ? "text-foreground border-b border-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {category.label}
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-24 bg-background">
        <div className="container mx-auto px-6 lg:px-12">
          {loading ? (
            <div className="text-center py-20 font-body text-muted-foreground">Carregando produtos...</div>
          ) : (
            <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
              {groupedProducts.map((product, index) => (
                <AnimatedSection key={product.groupId} delay={index * 0.05}>
                  <motion.div
                    layout
                    className="group cursor-pointer"
                    onClick={() => {
                      setSelectedProduct(product.groupId);
                      setSelectedImageIndex(getCardImageIndex(product));
                      setSelectedSize("M");
                    }}
                  >
                    <div className="image-reveal aspect-[3/4] bg-secondary mb-6 overflow-hidden relative">
                      {getProductImages(product).length > 1 && (
                        <>
                          <button
                            type="button"
                            aria-label="Foto anterior"
                            onClick={(event) => {
                              event.stopPropagation();
                              changeCardImage(product, "prev");
                            }}
                            className="absolute left-3 top-1/2 -translate-y-1/2 z-10 h-9 w-9 rounded-full bg-background/80 text-foreground border border-border hover:bg-background transition-colors flex items-center justify-center"
                          >
                            <ChevronLeft size={16} />
                          </button>
                          <button
                            type="button"
                            aria-label="Próxima foto"
                            onClick={(event) => {
                              event.stopPropagation();
                              changeCardImage(product, "next");
                            }}
                            className="absolute right-3 top-1/2 -translate-y-1/2 z-10 h-9 w-9 rounded-full bg-background/80 text-foreground border border-border hover:bg-background transition-colors flex items-center justify-center"
                          >
                            <ChevronRight size={16} />
                          </button>
                        </>
                      )}
                      <AnimatePresence initial={false}>
                        <motion.img
                          key={getProductImages(product)[getCardImageIndex(product)] || product.id}
                          src={getProductImages(product)[getCardImageIndex(product)] || ""}
                          alt={product.nome}
                          className="absolute inset-0 w-full h-full object-cover"
                          initial={{ opacity: 0, scale: 1.01 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.99 }}
                          whileHover={{ scale: 1.05 }}
                          transition={imageTransition}
                        />
                      </AnimatePresence>
                    </div>
                    <div className="text-center">
                      <p className="font-body text-xs text-muted-foreground tracking-wider uppercase mb-2">
                        {product.categoria}
                      </p>
                      <h3 className="font-display text-xl tracking-wide text-foreground mb-2">{product.nome}</h3>
                      <p className="font-body text-sm text-foreground">{formatPrice(product.preco)}</p>
                    </div>
                  </motion.div>
                </AnimatedSection>
              ))}
            </motion.div>
          )}

          {!loading && groupedProducts.length === 0 && (
            <div className="text-center py-20 font-body text-muted-foreground">
              Nenhum produto encontrado nesta aba.
            </div>
          )}
        </div>
      </section>

      {selected && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center p-6"
          onClick={() => setSelectedProduct(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-background max-w-4xl w-full grid grid-cols-1 lg:grid-cols-2 border border-border"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="relative bg-secondary min-h-[420px] lg:min-h-[620px]">
              {getProductImages(selected).length > 1 && (
                <>
                  <button
                    type="button"
                    aria-label="Foto anterior"
                    onClick={() => changeSelectedImage("prev")}
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-background/80 text-foreground border border-border hover:bg-background transition-colors flex items-center justify-center"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    type="button"
                    aria-label="Próxima foto"
                    onClick={() => changeSelectedImage("next")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-background/80 text-foreground border border-border hover:bg-background transition-colors flex items-center justify-center"
                  >
                    <ChevronRight size={18} />
                  </button>
                </>
              )}
              <AnimatePresence initial={false}>
                <motion.img
                  key={getProductImages(selected)[selectedImageIndex] || selected.groupId}
                  src={getProductImages(selected)[selectedImageIndex] || selected.imagemUrl}
                  alt={selected.nome}
                  className="absolute inset-0 w-full h-full object-contain"
                  initial={{ opacity: 0, scale: 1.01 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.99 }}
                  transition={imageTransition}
                />
              </AnimatePresence>
            </div>
            <div className="p-8 lg:p-12 flex flex-col justify-center">
              <p className="font-body text-xs text-muted-foreground tracking-wider uppercase mb-4">
                {selected.categoria}
              </p>
              <h2 className="font-display text-3xl lg:text-4xl text-foreground mb-4">{selected.nome}</h2>
              <p className="font-body text-base text-muted-foreground mb-6">{selected.descricao}</p>
              <p className="font-body text-xl text-foreground mb-8">{formatPrice(selected.preco)}</p>

              <div className="mb-8">
                <p className="font-body text-xs text-muted-foreground tracking-wider uppercase mb-3">
                  Tamanho
                </p>
                <div className="flex items-center gap-2">
                  {(["P", "M", "G"] as ProductSize[]).map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      className={`h-10 min-w-10 px-4 border text-sm font-body transition-colors ${
                        selectedSize === size
                          ? "border-foreground bg-foreground text-background"
                          : "border-border text-foreground hover:border-foreground"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  if (!selectedSize) {
                    return;
                  }

                  addItem({
                    id: selected.id,
                    name: selected.nome,
                    price: selected.preco,
                    image: getProductImages(selected)[selectedImageIndex] || selected.imagemUrl,
                    size: selectedSize,
                  });
                  setSelectedProduct(null);
                }}
                className="px-8 py-4 bg-foreground text-background font-body text-sm tracking-wider uppercase hover:bg-foreground/90 transition-colors duration-300 text-center flex items-center justify-center gap-2"
              >
                <ShoppingBag size={16} />
                Adicionar à Sacola
              </motion.button>
              <button
                onClick={() => setSelectedProduct(null)}
                className="mt-4 font-body text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Fechar
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </Layout>
  );
};

export default Catalogo;
