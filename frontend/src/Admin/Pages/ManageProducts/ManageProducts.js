import "./ManageProducts.css";
import React, { useState, useEffect,} from "react";
// import all_product from "../../../data/all_product";
import { FaPlusCircle } from "react-icons/fa";

// import components
import AdminItem from "../../Components/Card/AdminItem/AdminItem";
import ProductForm from "../../Components/ProductForm/ProductForm";
import LoadingOverlay from "../../../Components/LoadingOverlay/LoadingOverlay";

// import APIs
import { getAllProducts, getProductsByCategoryAPI, searchProductsAPI } from "../../../api/productService";

// import utils
import { vnd } from "../../../utils/currencyUtils"
import useDebounce from "../../../utils/useDebounce";

function ManageProducts() {
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [products, setProducts] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [limit, setLimit] = useState(20);

  const [selectedProductCategory, setSelectedProductCategory] = useState('Tất cả');
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500); // searchTerm with a 500ms update delay

  const fetchProducts = () => {
    // if no search term
    if (debouncedSearchTerm.trim() === '' ) {
      if (selectedProductCategory === 'Tất cả') {
        fetchProductsAll(currentPage, limit);
      } else {
        fetchProductsByCategory(selectedProductCategory, currentPage, limit)
      }
    }
    // if yes search term
    else {
      // clear category upon search
      setSelectedProductCategory('Tất cả')
      searchProducts(debouncedSearchTerm, currentPage, limit);
    }
  };

  // Fetch products method (from all product)
  const fetchProductsAll = async (page = 1, limit = 20) => {
    setLoading(true);
    try {
      const response = await getAllProducts(page, limit);
      setProducts(response.data.list);
      setTotalProducts(response.data.total);
      setTotalPages(response.data.totalPages)
    }
    catch (error) {
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
      setCurrentPage(response.data.page);
      setLimit(response.data.limit);
      setTotalPages(response.data.totalPages)
    }
    catch (error) {
      console.log(error);
      alert("Fetch products by category failed, see console");
    }
    setLoading(false);
  };

  // Fetch new page upon page change
  useEffect(() => {
    fetchProducts()
  }, [currentPage, selectedProductCategory, debouncedSearchTerm]);

  // Fetch products method (from all product)
  const searchProducts = async (query= '', page = 1, limit = 20) => {
    setLoading(true);
    try {
      const response = await searchProductsAPI(query, page, limit);
      setProducts(response.data.list);
      setTotalProducts(response.data.total);
      setCurrentPage(response.data.page);
      setLimit(response.data.limit);
      setTotalPages(response.data.totalPages)
    }
    catch (error) {
      console.log(error);
      alert("Search products failed, see console");
    }
    setLoading(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim() === '') {
      fetchProductsAll();
    } else {
      searchProducts(searchTerm);
    }
  }

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
    if (event.key === 'Escape') {
      // Only close if the form is actually visible
      if (isFormVisible) {
        setIsFormVisible(false);
      }
    }
  };

  // useEffect Hook for event listener
  useEffect(() => {
    document.addEventListener('keydown', handleEscape);
    // cleanup listener
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isFormVisible]);

  return (
    <div className="ManageProducts-container">

      {loading && <LoadingOverlay/>}
      
      <div id="ManageProducts-header">
        <h2 style={{color: 'white'}}>📦Quản lí sản phẩm</h2>
      </div>
      
        <div className="ManageProducts-filter">
          <div className="category">
            <h3>Phân loại:</h3>
            <select
              onChange={(e) => setSelectedProductCategory(e.target.value)}
              value={selectedProductCategory}
              disabled={searchTerm}
            >
              <option value="" disabled>
                Lọc theo phân loại
              </option>
              <option value='Tất cả'>Tất cả</option>
              <option value='Đồ tươi sống'>Đồ tươi sống</option>
              <option value='Rau củ quả'>Rau củ quả</option>
              <option value='Thực phẩm đóng gói'>Thực phẩm đóng gói</option>
              <option value='Nước chấm - gia vị'>Nước chấm - gia vị</option>
              <option value='Đồ uống - giải khát'>Đồ uống - giải khát</option>
              <option value='Bánh kẹo'>Bánh kẹo</option>
            </select>
          </div>

          <div className="search">
            <h3>Tìm theo tên sản phẩm:</h3>
            <form onSubmit={handleSearch}>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Nhập tên sản phẩm">
              </input>
            </form>
          </div>

          <div className="sort">
            <h3>Sẵn trong kho:</h3>
            <select>
              <option value="" disabled>
                Sắp xếp theo sẵn trong kho
              </option>
              <option value="Default">Mặc định</option>
              <option value="Ascending">Tăng dần</option>
              <option value="Descending">Giảm dần</option>
            </select>
          </div>

          <div className="sort">
            <h3>Giá thành:</h3>
            <select>
              <option value="" disabled>
                Sắp xếp theo giá
              </option>
              <option value="Default">Mặc định</option>
              <option value="Ascending">Tăng dần</option>
              <option value="Descending">Giảm dần</option>
            </select>
          </div>
        </div>

        <div className="admin-products-list">

        <header>Danh sách các sản phẩm</header>


        <div>Tổng cộng {totalProducts} sản phẩm</div>

        {/* Paging for products */}
        <div className="ManageProducts-paging">
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage <= 1 || loading}
          >
            Trước
          </button>

          <span>
            Trang {currentPage} trên {" "}
            {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage >= totalPages || loading}
          >
            Sau
          </button>
        </div>


        <table id="table">
          <thead>
            <tr>
              <th className="index">#</th>
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
              const index = i+1+(currentPage-1)*limit;
              return (
                <AdminItem
                  key={i}
                  index={index}
                  {...item}
                  onEdit={() => openForm("edit", item)}
                  onDelete={() => openForm("delete", item)}
                  />
                )
            })}
          </tbody>
        </table>


                {/* Paging for products */}
        <div className="ManageProducts-paging">
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage <= 1}
          >
            Trước
          </button>

          <span>
            Trang {currentPage} trên {" "}
            {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage >= totalPages}
          >
            Sau
          </button>
        </div>
      </div>

      <button id="add-product" onClick={() => openForm("add")}>
        <FaPlusCircle />
        Thêm sản phẩm
      </button>

      {/* Conditional Rendering of ProductForm */}
      {isFormVisible && (
        <div id="ProductForm-overlay">
          <ProductForm
            mode={formMode}
            currentItem={formCurrentItem}
            onCancel={() => setIsFormVisible(false)} // Pass a function to close the form
            onSuccess = {() => fetchProducts()}
          />
        </div>
      )}
    </div>
  );
}

export default ManageProducts;
