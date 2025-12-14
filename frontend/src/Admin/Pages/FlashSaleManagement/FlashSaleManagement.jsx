import { useState, useEffect } from 'react';
import { Search, Zap, Plus, Edit2, Trash2, Calendar, Clock, Package, Percent } from 'lucide-react';
import { AddBatchModal } from '../../Components/AddBatchModal/AddBatchModal';
import { EditBatchModal } from '../../Components/EditBatchModal/EditBatchModal';
import { AddFlashSaleProductModal } from '../../Components/AddFlashSaleProductModal/AddFlashSaleProductModal';
import { EditFlashSaleProductModal } from '../../Components/EditFlashSaleProductModal/EditFlashSaleProductModal';
import './FlashSaleManagement.css';

// Import API
import { fetchBatchesAPI, fetchFlashSaleProductsAPI } from '../../../api/flashSaleService';
import { getAllProducts } from '../../../api/productService';

export function FlashSaleManagement() {
  const [batches, setBatches] = useState([]);
  const [flashSaleProducts, setFlashSaleProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isAddBatchModalOpen, setIsAddBatchModalOpen] = useState(false);
  const [isEditBatchModalOpen, setIsEditBatchModalOpen] = useState(false);
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [isEditProductModalOpen, setIsEditProductModalOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBatches();
    fetchFlashSaleProducts();
    fetchAllProducts();
  }, []);

  const fetchBatches = async () => {
    setLoading(true);
    try {
      const response = await fetchBatchesAPI();
      setBatches(response.data || [])
    } catch (error) {
      console.log(error);
      alert("Fetch batches failed, see console");
    }
    setLoading(false);
  };

  const fetchFlashSaleProducts = async () => {
    setLoading(true);
    try {
      const response = await fetchFlashSaleProductsAPI();
      setFlashSaleProducts(response.data.list || [])
    } catch (error) {
      console.log(error);
      alert("Fetch flash sale products failed, see console");
    }
    setLoading(false);
  };

  const fetchAllProducts = async () => {
    setLoading(true);
    try {
      const response = await getAllProducts(1, 100);
      setAllProducts(response.data.list);
    } catch (error) {
      console.log(error);
      alert("Fetch products failed, see console");
    }
    setLoading(false);
  };

  const handleDeleteBatch = async (batchId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa đợt flash sale này?')) return;

    try {
      const response = await fetch(`/product/flash-sale/batches/${batchId}`, {
        method: 'DELETE',
      });
      const result = await response.json();
      if (result.success) {
        await fetchBatches();
        await fetchFlashSaleProducts();
        if (selectedBatch?._id === batchId) {
          setSelectedBatch(null);
        }
        alert('Xóa đợt flash sale thành công!');
      }
    } catch (error) {
      console.error('Error deleting batch:', error);
      alert('Lỗi khi xóa đợt flash sale!');
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này khỏi flash sale?')) return;

    try {
      const response = await fetch(`/product/flash-sale/products/${productId}`, {
        method: 'DELETE',
      });
      const result = await response.json();
      if (result.success) {
        await fetchFlashSaleProducts();
        alert('Xóa sản phẩm khỏi flash sale thành công!');
      }
    } catch (error) {
      console.error('Error deleting flash sale product:', error);
      alert('Lỗi khi xóa sản phẩm khỏi flash sale!');
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

    if (now < start) return 'upcoming';
    if (now > end) return 'ended';
    return 'active';
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active':
        return 'Đang diễn ra';
      case 'upcoming':
        return 'Sắp diễn ra';
      case 'ended':
        return 'Đã kết thúc';
      default:
        return '';
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'active':
        return 'status-active';
      case 'upcoming':
        return 'status-upcoming';
      case 'ended':
        return 'status-ended';
      default:
        return '';
    }
  };

  const filteredBatches = batches.filter((batch) => {
    const matchesSearch = batch.name.toLowerCase().includes(searchQuery.toLowerCase());
    const status = getBatchStatus(batch);
    const matchesStatus = statusFilter === 'all' || status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getProductsForBatch = (batchId) => {
    return flashSaleProducts.filter((product) => product.batchId === batchId);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="flash-sale-management">
      <div className="page-header flash-sale-header">
        <div className="page-header-content">
          <div className="page-header-icon">
            ⚡
          </div>
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

          <div className="filter-group search-group">

          </div>

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
              const status = getBatchStatus(batch);
              const productsInBatch = getProductsForBatch(batch._id);

              return (
                <div key={batch._id} className="batch-card">
                  <div className="batch-header">
                    <div className="batch-header-left">
                      <h2 className="batch-name">{batch.name}</h2>
                      <span className={`batch-status ${getStatusClass(status)}`}>
                        {getStatusText(status)}
                      </span>
                    </div>
                    <div className="batch-actions">
                      <button
                        onClick={() => handleEditBatch(batch)}
                        className="batch-action-btn edit-btn"
                        title="Chỉnh sửa"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteBatch(batch._id)}
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
                      <span className="time-value">{formatDate(batch.startTime)}</span>
                    </div>
                    <div className="time-item">
                      <Clock size={16} />
                      <span className="time-label">Kết thúc:</span>
                      <span className="time-value">{formatDate(batch.endTime)}</span>
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
                          setSelectedBatch(batch);
                          setIsAddProductModalOpen(true);
                        }}
                        className="add-product-btn"
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
                              <th>Tên sản phẩm</th>
                              <th>ID sản phẩm</th>
                              <th>Giảm giá</th>
                              <th>Tồn kho Flash Sale</th>
                              <th>Thao tác</th>
                            </tr>
                          </thead>
                          <tbody>
                            {productsInBatch.map((product) => (
                              <tr key={product._id}>
                                <td>
                                  <div className="product-name-cell">
                                    <Package size={16} />
                                    {product.productId?.name || product.productId || 'N/A'}
                                  </div>
                                </td>
                                <td className="product-id-cell">
                                  {typeof product.productId === 'string' 
                                    ? product.productId 
                                    : product.productId?._id || 'N/A'}
                                </td>
                                <td>
                                  <span className="discount-badge">
                                    <Percent size={14} />
                                    {product.discountPercentage}%
                                  </span>
                                </td>
                                <td>{product.stock}</td>
                                <td>
                                  <div className="product-actions">
                                    <button
                                      onClick={() => handleEditProduct(product)}
                                      className="product-action-btn edit-btn"
                                      title="Chỉnh sửa"
                                    >
                                      <Edit2 size={16} />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteProduct(product._id)}
                                      className="product-action-btn delete-btn"
                                      title="Xóa"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
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
          existingProducts={getProductsForBatch(selectedBatch._id)}
          onClose={() => {
            setIsAddProductModalOpen(false);
            setSelectedBatch(null);
          }}
          onSuccess={() => {
            fetchFlashSaleProducts();
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
            fetchFlashSaleProducts();
            setIsEditProductModalOpen(false);
            setEditingProduct(null);
          }}
        />
      )}
    </div>
  );
}