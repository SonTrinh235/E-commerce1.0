import "./ManageProducts.css";
import React, { useState, useEffect } from "react";
// import all_product from "../../../data/all_product";
import {
  FaPlusCircle,
  FaBox,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import { FiSearch } from "react-icons/fi";

// import components
import AdminItem from "../../Components/Card/AdminItem/AdminItem";
import ProductForm from "../../Components/ProductForm/ProductForm";
import LoadingOverlay from "../../../Components/LoadingOverlay/LoadingOverlay";

// import APIs
import {
  getAllProducts,
  getProductsByCategoryAPI,
  searchProductsAPI,
} from "../../../api/productService";
import { getAllCategrories } from "../../../api/categoryService";

// import utils
import { vnd } from "../../../utils/currencyUtils";
import useDebounce from "../../../utils/useDebounce";

function ManageProducts() {
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [products, setProducts] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [limit, setLimit] = useState(20);

  const [categoryList, setCategoryList] = useState([]);

  const [selectedProductCategory, setSelectedProductCategory] =
    useState("Tất cả");
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500); // searchTerm with a 500ms update delay

  const fetchProducts = (page) => {
    // if no search term
    if (debouncedSearchTerm.trim() === "") {
      if (selectedProductCategory === "Tất cả") {
        fetchProductsAll(page, limit);
      } else {
        fetchProductsByCategory(selectedProductCategory, page, limit);
      }
    }
    // if yes search term
    else {
      // clear category upon search
      setSelectedProductCategory("Tất cả");
      searchProducts(debouncedSearchTerm, page, limit);
    }
  };

  // Fetch products method (from all product)
  const fetchProductsAll = async (page = 1, limit = 20) => {
    setLoading(true);
    try {
      const response = await getAllProducts(page, limit);
      setProducts(response.data.list);
      setTotalProducts(response.data.total);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.log(error);
      alert("Fetch products failed, see console");
    }
    setLoading(false);
  };

  // Fetch products by category
  const fetchProductsByCategory = async (category, page = 1, limit = 20) => {
    setLoading(true);
    try {
      const response = await getProductsByCategoryAPI(category, page, limit);
      setProducts(response.data.list);
      setTotalProducts(response.data.total);
      setLimit(response.data.limit);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.log(error);
      alert("Fetch products by category failed, see console");
    }
    setLoading(false);
  };

  useEffect(() => {
    setCurrentPage(1);
    fetchProducts(1);
  }, [selectedProductCategory, debouncedSearchTerm]);

  // Fetch new page upon page change
  useEffect(() => {
    fetchProducts(currentPage);
  }, [currentPage]);

  // Fetch products method (from all product)
  const searchProducts = async (query = "", page = 1, limit = 20) => {
    setLoading(true);
    try {
      const response = await searchProductsAPI(query, page, limit);
      setProducts(response.data.list);
      setTotalProducts(response.data.total);
      setLimit(response.data.limit);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.log(error);
      alert("Search products failed, see console");
    }
    setLoading(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim() === "") {
      fetchProductsAll();
    } else {
      searchProducts(searchTerm);
    }
  };

  // Fetch products method (from all product)
  const fetchCategoryList = async () => {
    setLoading(true);
    try {
      const response = await getAllCategrories();
      setCategoryList(response.data);
    } catch (error) {
      console.log(error);
      alert("Fetch category list failed, see console");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCategoryList();
  }, []);

  // State of  ProductForm
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [formMode, setFormMode] = useState("");
  const [formCurrentItem, setFormCurrentItem] = useState(null);

  // Open form with mode "add", "edit", "delete"
  const openForm = (mode, currentItem = null) => {
    setFormMode(mode);
    setFormCurrentItem(currentItem);
    setIsFormVisible(true);
  };

  // Function to handle escape to close form
  const handleEscape = (event) => {
    if (event.key === "Escape") {
      // Only close if the form is actually visible
      if (isFormVisible) {
        setIsFormVisible(false);
      }
    }
  };

  // useEffect Hook for event listener
  useEffect(() => {
    document.addEventListener("keydown", handleEscape);
    // cleanup listener
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isFormVisible]);

  return (
    <div className="ManageProducts-container">
      {loading && <LoadingOverlay />}

      <div className="ManageProducts-header">
        <div className="ManageProducts-header-content">
          <div className="ManageProducts-header-icon">
            📦
          </div>
          <h2
            className="ManageProducts-header-title"
            style={{ color: "white" }}
          >
            Quản lí sản phẩm
          </h2>
        </div>
      </div>

      <div className="ManageProducts-filters-container">
        <div className="ManageProducts-filters-grid">
          <div className="filter-group">
            <label className="filter-label">Phân loại:</label>
            <select
              onChange={(e) => setSelectedProductCategory(e.target.value)}
              value={selectedProductCategory}
              disabled={searchTerm}
              className="filter-select"
            >
              <option value="" disabled>
                Lọc theo phân loại
              </option>
              <option value="Tất cả">Tất cả</option>
              {categoryList.map((category, i) => {
                return (
                  <option key={category.slug} value={category.slug}>
                    {category.name}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="filter-group search-group">
            <label className="filter-label">Tìm theo tên sản phẩm:</label>
            <div className="search-input-wrapper">
              <FiSearch stroke="#9ca3af" className="search-icon" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Nhập tên sản phẩm"
                className="filter-input"
              />
            </div>
          </div>

          <div className="filter-group">
            <label className="filter-label">Sẵn trong kho:</label>
            <select className="filter-select">
              <option value="" disabled>
                Sắp xếp theo sẵn trong kho
              </option>
              <option value="Default">Mặc định</option>
              <option value="Ascending">Tăng dần</option>
              <option value="Descending">Giảm dần</option>
            </select>
          </div>

          <div className="filter-group price-filter">
            <label className="filter-label">Giá thành:</label>
            <select className="filter-select">
              <option value="" disabled>
                Sắp xếp theo giá
              </option>
              <option value="Default">Mặc định</option>
              <option value="Ascending">Tăng dần</option>
              <option value="Descending">Giảm dần</option>
            </select>
          </div>
        </div>
      </div>

      <div className="product-table-container">
        <div className="table-header">
          <div className="table-header-info">
            <h2>Danh sách các sản phẩm</h2>
            <p>Tổng cộng {totalProducts} sản phẩm</p>
          </div>
          <button onClick={() => openForm("add")} className="add-product-btn">
            <FaPlusCircle fill="white" />
            Thêm sản phẩm
          </button>
        </div>

        <div className="table-wrapper">
          <table className="product-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Hình ảnh</th>
                <th>Tên sản phẩm</th>
                <th>Phân loại</th>
                <th>Giá thành/1</th>
                <th>Mô tả sản phẩm</th>
                <th>Sẵn trong kho</th>
                <th>Chỉnh sửa</th>
              </tr>
            </thead>
            <tbody>
              {products.map((item, i) => {
                const index = i + 1 + (currentPage - 1) * limit;
                return (
                  <AdminItem
                    key={i}
                    index={index}
                    {...item}
                    onEdit={() => openForm("edit", item)}
                    onDelete={() => openForm("delete", item)}
                  />
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="admin-table-footer">
          <div className="pagination-info">
            Trang {currentPage} trên {totalPages}
          </div>
          <div className="pagination-buttons">
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage <= 1}
              className="pagination-btn"
            >
              <FaChevronLeft size={18} />
              Trước
            </button>

            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="pagination-btn"
            >
              Sau
              <FaChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Conditional Rendering of ProductForm */}
      {isFormVisible && (
        <div id="ProductForm-overlay">
          <ProductForm
            mode={formMode}
            categoryList={categoryList}
            currentItem={formCurrentItem}
            onCancel={() => setIsFormVisible(false)} // Pass a function to close the form
            onSuccess={() => {
              fetchProducts();
              fetchCategoryList();
            }}
          />
        </div>
      )}
    </div>
  );
}

export default ManageProducts;
