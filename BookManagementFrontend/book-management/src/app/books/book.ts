export interface Book {
  id: number;
  name: string;
  categoryName: string;
  price: number;
  publishedDate: string;
}

export interface SaveBookRequest {
  name: string;
  categoryId: number;
  price: number;
  publishedDate: string;
}