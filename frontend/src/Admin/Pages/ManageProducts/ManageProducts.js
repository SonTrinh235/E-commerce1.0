import "./ManageProducts.css";
import React, { useState, useEffect,} from "react";
// import all_product from "../../../data/all_product";
import { FaPlusCircle } from "react-icons/fa";
import { getAllProducts, getProductsByCategoryAPI, searchProductsAPI } from "../../../api/productService";

import AdminItem from "../../Components/Card/AdminItem/AdminItem";
import ProductForm from "../../Components/ProductForm/ProductForm";

function ManageProducts() {
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [products, setProducts] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [limit, setLimit] = useState(20);

  const [searchInput, setSearchInput] = useState('');

  // Fetch products method (from all product)
  const fetchProducts = async (page = 1, limit = 20) => {
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

  // Fetch new page upon page change
  useEffect(() => {
    if (searchInput.trim() === '' ) {
      fetchProducts(currentPage, limit);
    } else {
      searchProducts(searchInput, currentPage, limit);
    }
  }, [currentPage]);

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
    if (searchInput.trim() === '') {
      fetchProducts();
    } else {
      searchProducts(searchInput);
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

  return (
    <div className="ManageProducts-container">
      <div id="ManageProducts-header">
        <h2 style={{color: 'white'}}>📦Quản lí sản phẩm</h2>
      </div>

      {/* List of Products  */}
      {/* <div className="admin-products-list">
        <div className="index">
        <p>Product ID</p>
        <p>Image</p>
        <p>Category</p>
        <p>New price</p>
        <p>Old price</p>
        <p>Actions</p>
        </div>
        <div>
        {all_product.map((item, i) => (
          <AdminItem key={i} {...item} />
          ))}
          </div>
          </div> */}

      
        <div className="ManageProducts-filter">
          <div className="category">
            <h3>Phân loại:</h3>
            <select
              // onChange={handleProductCategoryChange}
              // value={selectedProductCategory}
            >
              <option value="" disabled>
                Lọc theo phân loại
              </option>
              <option value="All">Tất cả</option>
              <option value="Meats">Meats</option>
              <option value="Vegetables">Vegetables</option>
              <option value="Others">Others</option>
            </select>
          </div>

          <div className="search">
            <h3>Tìm theo tên sản phẩm:</h3>
            <form onSubmit={handleSearch}>
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
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
            onSuccess = {() => fetchProducts(currentPage, limit)}
          />
        </div>
      )}
    </div>
  );
}

export default ManageProducts;
