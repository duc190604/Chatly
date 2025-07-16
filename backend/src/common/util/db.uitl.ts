import mongoose from 'mongoose';

// Types
type ObjectIdLike = mongoose.Types.ObjectId | string | { _bsontype: 'ObjectId' };

interface ConvertibleObject {
  [key: string]: any;
}

type ConvertibleData = ConvertibleObject | ConvertibleObject[] | ObjectIdLike | any;

/**
 * Chuyển đổi ObjectId thành string cho object hoặc array
 * @param data - Dữ liệu cần chuyển đổi
 * @param excludeFields - Danh sách field không muốn chuyển đổi (optional)
 * @returns Dữ liệu đã được chuyển đổi
 */
export function convertObjectIdToString<T extends ConvertibleData>(
  data: T,
  excludeFields: string[] = []
): T {
  // Kiểm tra nếu data là null hoặc undefined
  if (data === null || data === undefined) {
    return data;
  }

  // Nếu là array, xử lý từng phần tử
  if (Array.isArray(data)) {
    return data.map(item => convertObjectIdToString(item, excludeFields)) as T;
  }

  // Nếu là ObjectId, chuyển thành string
  if (isObjectId(data)) {
    return data.toString() as T;
  }

  // Nếu là Date, giữ nguyên
  if (data instanceof Date) {
    return data;
  }

  // Nếu là object, xử lý từng property
  if (typeof data === 'object' && data !== null) {
    const result: any = {};

    for (const [key, value] of Object.entries(data)) {
      // Bỏ qua field trong excludeFields
      if (excludeFields.includes(key)) {
        result[key] = value;
        continue;
      }

      // Xử lý đệ quy cho nested objects
      if (value !== null && typeof value === 'object') {
        result[key] = convertObjectIdToString(value, excludeFields);
      } else {
        result[key] = value;
      }
    }

    return result as T;
  }

  // Các kiểu dữ liệu khác giữ nguyên
  return data;
}

/**
 * Kiểm tra xem một giá trị có phải là ObjectId hay không
 * @param value - Giá trị cần kiểm tra
 * @returns true nếu là ObjectId
 */
function isObjectId(value: any): value is ObjectIdLike {
  return (
    value instanceof mongoose.Types.ObjectId ||
    (typeof value === 'object' && value !== null && value._bsontype === 'ObjectId') ||
    (mongoose.Types.ObjectId.isValid(value) && typeof value === 'string')
  );
}