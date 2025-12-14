import { useState, useEffect } from "react";
import {
  Search,
  Zap,
  Plus,
  Edit2,
  Trash2,
  Calendar,
  Clock,
  Package,
  Percent,
} from "lucide-react";
import { AddBatchModal } from "../../Components/AddBatchModal/AddBatchModal";
import { EditBatchModal } from "../../Components/EditBatchModal/EditBatchModal";
import { AddFlashSaleProductModal } from "../../Components/AddFlashSaleProductModal/AddFlashSaleProductModal";
import { EditFlashSaleProductModal } from "../../Components/EditFlashSaleProductModal/EditFlashSaleProductModal";
import "./FlashSaleManagement.css";

// Import API
import {
  fetchBatchesAPI,
  fetchFlashSaleProductsAPI,
  getAllFlashSaleProductAPI,
  deleteFlashSaleBatchAPI,
  fetchNoFlashSaleProductsAPI,
  deleteFlashSaleProductAPI
} from "../../../api/flashSaleService";
import { getAllProducts } from "../../../api/productService";

// Import utils
import { formatDate } from "../../../utils/dateUtils";
import { vnd } from "../../../utils/currencyUtils";

export function FlashSaleManagement() {
  const [batches, setBatches] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAddBatchModalOpen, setIsAddBatchModalOpen] = useState(false);
  const [isEditBatchModalOpen, setIsEditBatchModalOpen] = useState(false);
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [isEditProductModalOpen, setIsEditProductModalOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(async () => {
    await fetchBatches();
    await fetchNonFlashSaleProducts();
  }, []);

  const fetchBatches = async () => {
    setLoading(true);
    try {
      const response = await fetchBatchesAPI();
      const batchesObject = response.data;
      setBatches(Object.values(batchesObject) || []);
    } catch (error) {
      console.log(error);
      alert("Fetch batches failed, see console");
    }
    setLoading(false);
  };

  const fetchNonFlashSaleProducts = async () => {
    setLoading(true);
    try {
      const response = await fetchNoFlashSaleProductsAPI();
      setAllProducts(response.data);
    } catch (error) {
      console.log(error);
      alert("Fetch products failed, see console");
    }
    setLoading(false);
  };

  const handleDeleteBatch = async (batchId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa đợt flash sale này?"))
      return;

    try {
      const response = await deleteFlashSaleBatchAPI(batchId);
      alert("Xóa đợt flash sale thành công!");
      fetchBatches();
      fetchNonFlashSaleProducts();
    } catch (error) {
      console.error("Error deleting batch:", error);
      alert("Lỗi khi xóa đợt flash sale!");
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (
      !window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này khỏi flash sale?")
    )
      return;

    try {
      const response = await deleteFlashSaleProductAPI(productId);
      fetchBatches();
      fetchNonFlashSaleProducts();
      alert("Xóa sản phẩm khỏi flash sale thành công!");
    } catch (error) {
      console.error("Error deleting flash sale product:", error);
      alert("Lỗi khi xóa sản phẩm khỏi flash sale!");
    }
  };

  const handleEditBatch = (batch) => {
    setEditingBatch(batch);
    setIsEditBatchModalOpen(true);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setIsEditProductModalOpen(true);
  };

  const getBatchStatus = (batch) => {
    const now = new Date();
    const start = new Date(batch.startTime);
    const end = new Date(batch.endTime);

    if (now < start) return "upcoming";
    if (now > end) return "ended";
    return "active";
  };

  const getStatusText = (status) => {
    switch (status) {
      case "active":
        return "Đang diễn ra";
      case "upcoming":
        return "Sắp diễn ra";
      case "ended":
        return "Đã kết thúc";
      default:
        return "";
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "active":
        return "status-active";
      case "upcoming":
        return "status-upcoming";
      case "ended":
        return "status-ended";
      default:
        return "";
    }
  };

  const filteredBatches = batches.filter((batch) => {
    const matchesSearch = batch.batchInfo.name.toLowerCase().includes(searchQuery.toLowerCase());
    const status = getBatchStatus(batch.batchInfo);
    const matchesStatus = statusFilter === 'all' || status === statusFilter;
    return matchesSearch && matchesStatus;
  });


  return (
    <div className="flash-sale-management">
      <div className="page-header flash-sale-header">
        <div className="page-header-content">
          <div className="page-header-icon">⚡</div>
          <h1 className="page-header-title">Quản lí Flash Sale</h1>
        </div>
      </div>

      <div className="filters-container">
        <div className="filters-grid">
          <div className="filter-group">
            <label className="filter-label">Trạng thái:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">Tất cả</option>
              <option value="active">Đang diễn ra</option>
              <option value="upcoming">Sắp diễn ra</option>
              <option value="ended">Đã kết thúc</option>
            </select>
          </div>

          <div className="filter-group search-group"></div>

          <div className="filter-group">
            <button
              onClick={() => setIsAddBatchModalOpen(true)}
              className="add-batch-btn"
            >
              <Plus size={20} />
              Thêm đợt Flash Sale
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      ) : (
        <div className="batches-container">
          {filteredBatches.length === 0 ? (
            <div className="empty-state">
              <Zap size={64} className="empty-icon" />
              <h3>Chưa có đợt flash sale nào</h3>
              <p>Tạo đợt flash sale đầu tiên để bắt đầu</p>
              <button
                onClick={() => setIsAddBatchModalOpen(true)}
                className="add-batch-btn-empty"
              >
                <Plus size={20} />
                Thêm đợt Flash Sale
              </button>
            </div>
          ) : (
            filteredBatches.map((batch) => {
              const batchInfo = batch.batchInfo;
              const status = getBatchStatus(batchInfo);
              const productsInBatch = batch.products;

              return (
                <div key={batchInfo._id} className="batch-card">
                  <div className="batch-header">
                    <div className="batch-header-left">
                      <h2 className="batch-name">{batchInfo.name}</h2>
                      <span
                        className={`batch-status ${getStatusClass(status)}`}
                      >
                        {getStatusText(status)}
                      </span>
                    </div>
                    <div className="batch-actions">
                      <button
                        onClick={() => handleEditBatch(batchInfo)}
                        className="batch-action-btn edit-btn"
                        title="Chỉnh sửa"
                        disabled={status === 'ended'}
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteBatch(batchInfo._id)}
                        className="batch-action-btn delete-btn"
                        title="Xóa"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>

                  <div className="batch-time-info">
                    <div className="time-item">
                      <Calendar size={16} />
                      <span className="time-label">Bắt đầu:</span>
                      <span className="time-value">
                        {formatDate(batchInfo.startTime)}
                      </span>
                    </div>
                    <div className="time-item">
                      <Clock size={16} />
                      <span className="time-label">Kết thúc:</span>
                      <span className="time-value">
                        {formatDate(batchInfo.endTime)}
                      </span>
                    </div>
                  </div>

                  <div className="batch-products-section">
                    <div className="batch-products-header">
                      <h3 className="batch-products-title">
                        <Package size={18} />
                        Sản phẩm ({productsInBatch.length})
                      </h3>
                      <button
                        onClick={() => {
                          setSelectedBatch(batchInfo);
                          setIsAddProductModalOpen(true);
                        }}
                        className="add-product-btn"
                        disabled={status === 'ended'}
                      >
                        <Plus size={16} />
                        Thêm sản phẩm
                      </button>
                    </div>

                    {productsInBatch.length === 0 ? (
                      <div className="no-products">
                        <p>Chưa có sản phẩm nào trong đợt này</p>
                      </div>
                    ) : (
                      <div className="products-table-wrapper">
                        <table className="products-table">
                          <thead>
                            <tr>
                              <th>Sản phẩm</th>
                              <th>Tên sản phẩm</th>
                              <th>Giá gốc</th>
                              <th>Giảm giá</th>
                              <th>Giá bán</th>
                              <th>Số lượng Sale</th>
                              <th>Số lượng đã bán</th>
                              <th>Thao tác</th>
                            </tr>
                          </thead>
                          <tbody>
                            {productsInBatch.map((product) => {
                              return (
                                <tr key={product.productId}>
                                  <td>
                                    <img
                                      src={product.imageInfo?.url || ''}
                                      className="cell-product-image"
                                    />
                                  </td>
                                  <td>
                                    <div className="product-name-cell">
                                      {product.name ||
                                        product.productId ||
                                        "N/A"}
                                    </div>
                                  </td>
                                  <td className="product-old-price-cell">
                                    {vnd(product.price)}
                                  </td>
                                  <td>
                                    <span className="discount-badge">
                                      {product.flashSaleInfo?.discountPercentage || 0}%
                                    </span>
                                  </td>
                                  <td>
                                    <span className="product-price-cell">
                                      {vnd(product.flashSaleInfo?.discountPrice || product.price)}
                                    </span>
                                  </td>
                                  <td>{product.flashSaleInfo?.stock}</td>
                                  <td>{product.flashSaleInfo?.sold || 0}</td>
                                  <td>
                                    <div className="product-actions">
                                      <button
                                        onClick={() =>
                                          handleEditProduct(product)
                                        }
                                        className="product-action-btn edit-btn"
                                        title="Chỉnh sửa"
                                        disabled={status === 'ended'}
                                      >
                                        <Edit2 size={16} />
                                      </button>
                                      <button
                                        onClick={() =>
                                          handleDeleteProduct(product._id)
                                        }
                                        className="product-action-btn delete-btn"
                                        title="Xóa"
                                        disabled={status === 'ended'}
                                      >
                                        <Trash2 size={16} />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {isAddBatchModalOpen && (
        <AddBatchModal
          onClose={() => setIsAddBatchModalOpen(false)}
          onSuccess={() => {
            fetchBatches();
            setIsAddBatchModalOpen(false);
          }}
        />
      )}

      {isEditBatchModalOpen && editingBatch && (
        <EditBatchModal
          batch={editingBatch}
          onClose={() => {
            setIsEditBatchModalOpen(false);
            setEditingBatch(null);
          }}
          onSuccess={() => {
            fetchBatches();
            setIsEditBatchModalOpen(false);
            setEditingBatch(null);
          }}
        />
      )}

      {isAddProductModalOpen && selectedBatch && (
        <AddFlashSaleProductModal
          batch={selectedBatch}
          allProducts={allProducts}
          onClose={() => {
            setIsAddProductModalOpen(false);
            setSelectedBatch(null);
          }}
          onSuccess={() => {
            fetchBatches();
            fetchNonFlashSaleProducts();
            setIsAddProductModalOpen(false);
            setSelectedBatch(null);
          }}
        />
      )}

      {isEditProductModalOpen && editingProduct && (
        <EditFlashSaleProductModal
          product={editingProduct}
          batches={batches}
          onClose={() => {
            setIsEditProductModalOpen(false);
            setEditingProduct(null);
          }}
          onSuccess={() => {
            fetchBatches();
            setIsEditProductModalOpen(false);
            setEditingProduct(null);
          }}
        />
      )}
    </div>
  );
}
