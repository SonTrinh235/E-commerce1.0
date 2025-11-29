import { useEffect, useState } from "react";
import "./ProductForm.css";
import DefaultImage from "../../../assets/placeholder-image.png";
import { FaArrowLeft} from "react-icons/fa";
import {
  createProduct,
  updateProduct,
  deleteProduct,
  updateProductImageInfo,
} from "../../../api/productService";
import { uploadFile } from "../../../api/fileService";

import LoadingOverlay from "../../../Components/LoadingOverlay/LoadingOverlay";

function ProductForm({ mode, categoryList, currentItem = null, onCancel, onSuccess }) {
  const [loading, setLoading] = useState(false);

  // Properties of form
  const [formData, setFormData] = useState({
    productImage: null,
    productName: "",
    productCategory: "",
    productPrice: "",
    productDescription: "",
    productStock: "",
  });

  // UseEffect for initial data of form (currentItem or blank)
  useEffect(() => {
    if (currentItem) {
      setFormData({
        productImage: null,
        productName: currentItem.name || "",
        productCategory: currentItem.categoryId || "",
        productPrice: currentItem.price || "",
        productDescription: currentItem.description || "",
        productStock: currentItem.stock || "",
      });
    } else {
      setFormData({
        productImage: null,
        productName: "",
        productCategory: "",
        productPrice: "",
        productDescription: "",
        productStock: "",
      });
    }
    console.log("currentItem: ", currentItem);
  }, [currentItem]);

  // Handle change for input fields
  const handleChange = (e) => {
    if (mode === "delete") {
      return;
    }

    const { name, value, type, files } = e.target;

    let newValue = value;

    if (type === "file") {
      newValue = files[0];
    }

    setFormData((prevData) => ({ ...prevData, [name]: newValue }));
  };

  // Handle Submit based on form mode
  const handleSubmit = async (e) => {
    setLoading(true);

    e.preventDefault(); // Prevent default browser form submission

    try {
      // let response;

      if (mode === "add") {
        // 1. ADD MODE: Call the API to create a new product
        console.log("Submitting new product...");
        const createProductResponse = await createProduct({
          name: formData.productName,
          price: formData.productPrice,
          description: formData.productDescription,
          categoryId: formData.productCategory,
          stock: formData.productStock,
        });

        const createdProductId = createProductResponse.data._id;

        // Upload image and update image info
        if (formData.productImage) {
          const uploadData = new FormData();
          
          // Append the text/string elements directly as key-value pairs
          uploadData.append("tempid", formData.productImage.name);
          uploadData.append("targetId", createdProductId);
          uploadData.append("bucket", "dath-product-image");
          uploadData.append("accessLevel", "public");
          // Append image file
          uploadData.append("file", formData.productImage);
          const uploadFileResponse = await uploadFile(uploadData);

          const uploadedImageInfo = {
            imageInfo: {
              fileId: uploadFileResponse.data.fileId,
              url: uploadFileResponse.data.url,
              status: uploadFileResponse.data.status,
            },
          };

          updateProductImageInfo(createdProductId, uploadedImageInfo);
        }

        alert("Product created successfully!");
      } else if (mode === "edit") {
        // 2. EDIT MODE: Call the API to update the existing product
        // productId required
        const productId = currentItem._id;
        console.log(`Updating product ${productId}...`);
        updateProduct(productId, {
          name: formData.productName,
          price: formData.productPrice,
          description: formData.productDescription,
          categoryId: formData.productCategory,
          stock: formData.productStock,
        });

        // Upload and update image info if there is
        if (formData.productImage) {
          const uploadData = new FormData();
          
          // Append the text/string elements directly as key-value pairs
          uploadData.append("tempid", formData.productImage.name);
          uploadData.append("targetId", productId);
          uploadData.append("bucket", "dath-product-image");
          uploadData.append("accessLevel", "public");
          // Append image file
          uploadData.append("file", formData.productImage);
          const uploadFileResponse = await uploadFile(uploadData);

          const uploadedImageInfo = {
            imageInfo: {
              fileId: uploadFileResponse.data.fileId,
              url: uploadFileResponse.data.url,
              status: uploadFileResponse.data.status,
            },
          };

          updateProductImageInfo(productId, uploadedImageInfo);
        }

        alert("Product updated successfully!");
      } else if (mode === "delete") {
        // 3. DELETE MODE: Call the API to delete the existing product
        //  productId required
        const productId = currentItem._id;
        console.log(`Deleting product ${productId}...`);
        deleteProduct(productId);
        alert("Product Deleted successfully!");
      }

      onSuccess();
      onCancel();

      // Optional: Redirect user, close modal, or clear form here
    } catch (error) {
      console.error("Submission failed:", error);
      alert("Error saving product. Check the console for details.");
    }

    setLoading(false);
  };

  //  useEffect for image preview on upload
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  useEffect(() => {
    // Check if formData.productImage is a File object (not null/undefined)
    if (formData.productImage instanceof File) {
      // Create a temporary URL for the browser to display the image
      const url = URL.createObjectURL(formData.productImage);
      setImagePreviewUrl(url);

      // Cleanup: Revoke the object URL when the component unmounts or state changes
      return () => URL.revokeObjectURL(url);
    }
    // Handle when product data (initialData) already has a URL string (e.g., in Edit mode)
    else if (
      typeof formData.productImage === "string" &&
      formData.productImage
    ) {
      setImagePreviewUrl(formData.productImage);
    } else {
      setImagePreviewUrl(null);
    }
  }, [formData.productImage]);

  // Set text based on form mode
  let title = "Product Form";
  let subTitle = "Product Form";
  let submitText = "Submit";

  if (mode === "add") {
    title = "Thêm Sản Phẩm";
    subTitle = "Nhập thông tin cho sản phẩm mới:";
    submitText = "Thêm sản phẩm";
  } else if (mode === "edit") {
    title = "Chỉnh Sửa Sản Phẩm";
    subTitle = "Thông tin sản phẩm sẽ được thay bằng thông tin mới";
    submitText = "Xác nhận chỉnh sửa";
  } else if (mode === "delete") {
    title = "Xác nhận: Xóa sản phẩm";
    subTitle = "Sản phẩm này sẽ bị xóa, hãy xác nhận:";
    submitText = "Xóa sản phẩm";
  }

  const buttonClass =
    mode === "delete" ? "btn-delete" : mode === "edit" ? "btn-edit" : "btn-add";

  // Form container
  return (
    <div className="ProductForm-container">
      {loading && <LoadingOverlay/>}
      <header>
        <div id="title">{title}</div>
        <div id="subTitle">{subTitle}</div>
      </header>
      {/* Actual form */}
      <form className="product-form" onSubmit={handleSubmit}>
        {/* Image */}
        <div id="section-image">
          <div>Hình ảnh</div>
          {imagePreviewUrl ? (
            <img src={imagePreviewUrl} alt = ""/>
          ) : (
            <img src={currentItem?.imageUrl || currentItem?.imageInfo?.url || DefaultImage} alt = ""/>
          )}
          {mode !== "delete" && (
            <input
              type="file"
              id="upload-image"
              name="productImage"
              onChange={handleChange}
            />
          )}
        </div>
        {/* Data  */}
        <div id="section-data">
          <div>Tên sản phẩm:</div>
          <input
            name="productName"
            type="text"
            placeholder="Nhập tên sản phẩm"
            value={formData.productName}
            onChange={handleChange}
          />
          <div>Phân loại:</div>
          <select
            name="productCategory"
            value={formData.productCategory}
            onChange={handleChange}
          >
            <option value="" disabled>
              Chọn phân loại sản phẩm
            </option>
            {categoryList.map((category, i) => {
              return (
                <option key={category.slug} value={category._id}>{category.name}</option>
              )
            })
            }
          </select>
          <div>Giá thành/1:</div>
          <input
            name="productPrice"
            type="number"
            placeholder="Nhập giá thành sản phẩm"
            value={formData.productPrice}
            onChange={handleChange}
          />
          <div>Mô tả:</div>
          <textarea
            name="productDescription"
            type="text"
            placeholder="Nhập mô tả sản phẩm"
            value={formData.productDescription}
            onChange={handleChange}
          />
          <div>Sẵn trong kho:</div>
          <input
            name="productStock"
            type="number"
            placeholder="Nhập số lượng SP sẵn trong kho"
            value={formData.productStock}
            onChange={handleChange}
          />
        </div>
        <button type="submit" id="productForm-submit" className={buttonClass}>
          {submitText}
        </button>
      </form>
      <button id="ProductForm-cancel" onClick={onCancel}>
        <FaArrowLeft style={{marginRight: '5px'}} />
        Hủy
      </button>
    </div>
  );
}

export default ProductForm;
