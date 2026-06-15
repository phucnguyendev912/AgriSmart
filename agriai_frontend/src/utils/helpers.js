/**
 * Chuyển đổi đối tượng File thành chuỗi Base64 Data URL.
 * @param {File} file - File ảnh cần chuyển đổi
 * @returns {Promise<string>} Chuỗi Base64 Data URL
 */
export function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
    });
}

/**
 * Dựng lại đối tượng File từ chuỗi Base64 Data URL.
 * @param {string} base64String - Chuỗi Base64 Data URL
 * @param {string} filename - Tên file muốn tạo
 * @returns {File} Đối tượng File
 */
export function base64ToFile(base64String, filename = 'image.jpg') {
    const arr = base64String.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
}
