import { useState, useMemo } from "react";
import { PlusIcon, PencilIcon, Trash2Icon, XIcon, ImageIcon } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { productApi } from "../lib/api";
import { getStockStatusBadge } from "../lib/utils";
import SearchAndFilter from "../components/SearchFilter";
import { useSearchFilter } from "../hooks/useSearchFilter";

const PRODUCTS_FILTER_GROUPS = [
  {
    key: "category",
    options: [
      { label: "Todos",              value: "__all__" },
      { label: "Palitos Premium",    value: "Palitos Premium" },
      { label: "Palitos Cocteleros", value: "Palitos Cocteleros" },
      { label: "Dulces",             value: "Dulces" },
      { label: "Especiales",         value: "Especiales" },
      { label: "Nuevos",             value: "Nuevos" },
    ],
  },
  {
    key: "_stockStatus",
    options: [
      { label: "Todo el stock",  value: "__all__" },
      { label: "Disponible",     value: "disponible", activeClass: "bg-green-500 text-white border-green-500" },
      { label: "Bajo stock",     value: "bajo",       activeClass: "bg-yellow-400 text-white border-yellow-400" },
      { label: "Sin stock",      value: "sinstock",   activeClass: "bg-red-500 text-white border-red-500" },
    ],
  },
];

function ProductsPage() {
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    price: "",
    stock: "",
    description: "",
  });
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [productToDelete, setProductToDelete] = useState(null);

  const queryClient = useQueryClient();

  const { data: rawProducts = [] } = useQuery({
    queryKey: ["products"],
    queryFn: productApi.getAll,
  });

  const products = useMemo(
    () => rawProducts.map((p) => ({
      ...p,
      _stockStatus: p.stock === 0 ? "sinstock" : p.stock < 10 ? "bajo" : "disponible",
    })),
    [rawProducts]
  );

  const { filtered, query, setQuery, activeFilters, setFilter, clearAll, activeCount } =
    useSearchFilter({
      data: products,
      searchFields: ["name", "category", "description"],
      filterGroups: PRODUCTS_FILTER_GROUPS,
    });

  const createProductMutation = useMutation({
    mutationFn: productApi.create,
    onSuccess: () => {
      closeModal();
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: productApi.update,
    onSuccess: () => {
      closeModal();
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: productApi.delete,
    onSuccess: () => {
      closeModal();
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  const closeModal = () => {
    setShowModal(false);
    setEditingProduct(null);
    setFormData({
      name: "",
      category: "",
      price: "",
      stock: "",
      description: "",
    });
    setImages([]);
    setImagePreviews([]);
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      price: product.price.toString(),
      stock: product.stock.toString(),
      description: product.description,
    });
    setImagePreviews(product.images || []);
    setShowModal(true);
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 3) return alert("Solo se permiten hasta 3 imágenes");

    imagePreviews.forEach((url) => {
      if (url.startsWith("blob:")) URL.revokeObjectURL(url);
    });

    setImages(files);
    setImagePreviews(files.map((file) => URL.createObjectURL(file)));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!editingProduct && imagePreviews.length === 0) {
      return alert("Se requiere al menos una imagen");
    }

    const formDataToSend = new FormData();
    formDataToSend.append("name", formData.name);
    formDataToSend.append("description", formData.description);
    formDataToSend.append("price", formData.price);
    formDataToSend.append("stock", formData.stock);
    formDataToSend.append("category", formData.category);

    if (images.length > 0) images.forEach((image) => formDataToSend.append("images", image));

    if (editingProduct) {
      updateProductMutation.mutate({ id: editingProduct._id, formData: formDataToSend });
    } else {
      createProductMutation.mutate(formDataToSend);
    }
  };
  
  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Productos</h1>
          <p className="text-base-content/70 mt-1">Gestionar inventario de productos</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn btn-primary gap-2 text-white">
          <PlusIcon className="w-5 h-5" />
          Agregar Producto
        </button>
      </div>

      {/* SEARCH & FILTER */}
      <SearchAndFilter
        query={query}
        setQuery={setQuery}
        filterGroups={PRODUCTS_FILTER_GROUPS}
        activeFilters={activeFilters}
        setFilter={setFilter}
        clearAll={clearAll}
        activeCount={activeCount}
        placeholder=""
        resultCount={filtered.length}
        totalCount={products.length}
      />

      {/* PRODUCTS GRID */}
      {filtered.length === 0 ? (
        <p className="text-center text-base-content/60 py-12">No se encontraron productos con ese criterio.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filtered.map((product) => {
            const status = getStockStatusBadge(product.stock);

            return (
              <div key={product._id} className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <div className="flex items-center gap-6">
                    <div className="avatar">
                      <div className="w-24 h-24 rounded-xl bg-white flex items-center justify-center p-3 ring-1 ring-base-300">
                        <img 
                          className="w-full h-full object-contain"
                          src={product.images?.[0] ?? "/placeholder.png"} 
                          alt={product.name} 
                        />
                      </div>
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="card-title">{product.name}</h3>
                          <p className="text-base-content/70 text-sm">{product.category}</p>
                        </div>
                        <div className={`badge ${status.class}`}>{status.text}</div>
                      </div>
                      <div className="flex items-center gap-6 mt-4">
                        <div>
                          <p className="text-xs text-base-content/70">Precio</p>
                          <p className="font-bold text-lg">${product.price} COP</p>
                        </div>
                        <div>
                          <p className="text-xs text-base-content/70">Stock</p>
                          <p className="font-bold text-lg">{product.stock} unidades</p>
                        </div>
                      </div>
                    </div>

                    <div className="card-actions">
                      <button
                        className="btn btn-square btn-ghost"
                        onClick={() => handleEdit(product)}
                      >
                        <PencilIcon className="w-5 h-5" />
                      </button>
                      <button
                        className="btn btn-square btn-ghost text-error"
                        onClick={() => setProductToDelete(product)}
                      >
                          <Trash2Icon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ADD/EDIT PRODUCT MODAL */}

      <input type="checkbox" className="modal-toggle" checked={showModal} />

      <div className="modal">
        <div className="modal-box max-w-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-2xl">
              {editingProduct ? "Editar Producto" : "Agregar Producto"}
            </h3>

            <button onClick={closeModal} className="btn btn-sm btn-circle btn-ghost">
              <XIcon className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label">
                  <span>Producto</span>
                </label>

                <input
                  type="text"
                  placeholder="Nombre del Producto"
                  className="input input-bordered"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span>Categoria</span>
                </label>
                <select
                  className="select select-bordered"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                >
                  <option value="">Seleccionar categoria</option>
                  <option value="Palitos Premium">Palitos Premium</option>
                  <option value="Palitos Cocteleros">Palitos Cocteleros</option>
                  <option value="Dulces">Dulces</option>
                  <option value="Especiales">Especiales</option>
                  <option value="Nuevos">Nuevos</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label">
                  <span>Precio ($)</span>
                </label>
                <input
                  type="number"
                  step="100"
                  placeholder="0"
                  className="input input-bordered"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span>Stock</span>
                </label>
                <input
                  type="number"
                  placeholder="0"
                  className="input input-bordered"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-control flex flex-col gap-2">
              <label className="label">
                <span>Descripción</span>
              </label>
              <textarea
                className="textarea textarea-bordered h-24 w-full"
                placeholder="Descripción del Producto"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold text-base flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" />
                  Imágenes del Producto
                </span>
                <span className="label-text-alt text-xs opacity-60">Máximo tres imágenes</span>
              </label>

              <div className="bg-base-200 rounded-xl p-4 border-2 border-dashed border-base-300 hover:border-primary transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="file-input file-input-bordered file-input-primary w-full"
                  required={!editingProduct}
                />

                {editingProduct && (
                  <p className="text-xs text-base-content/60 mt-2 text-center">
                    Deja vacío para mantener las imágenes actuales
                  </p>
                )}
              </div>

              {imagePreviews.length > 0 && (
                <div className="flex gap-2 mt-2">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="avatar">
                      <div className="w-20 rounded-lg">
                        <img src={preview} alt={`Preview ${index + 1}`} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="modal-action">
              <button
                type="button"
                onClick={closeModal}
                className="btn"
                disabled={createProductMutation.isPending || updateProductMutation.isPending}
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={createProductMutation.isPending || updateProductMutation.isPending}
              >
                {createProductMutation.isPending || updateProductMutation.isPending ? (
                  <span className="loading loading-spinner"></span>
                ) : editingProduct ? (
                  "Actualizar"
                ) : (
                  "Agregar"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* DELETE CONFIRMATION MODAL */}
      <input
        type="checkbox"
        className="modal-toggle"
        checked={!!productToDelete}
      />

      <div className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">
            Eliminar Producto
          </h3>

          <p className="py-4">
            ¿Estás seguro de que deseas eliminar el producto?
          </p>

          <div className="modal-action">
            <button
              className="btn"
              onClick={() => setProductToDelete(null)}
            >
              Cancelar
            </button>

            <button
              className="btn"
              onClick={() => {
                deleteProductMutation.mutate(productToDelete._id);
                setProductToDelete(null);
              }}
            >
              {deleteProductMutation.isPending ? (
                <span className="loading loading-spinner"></span>
              ) : (
                "Eliminar"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductsPage