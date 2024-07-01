export interface Products {
  id: string;
  name: string;
  unitPrice: number;
  description: string;
  image: string[];
  quantity: number;
  total: number;
}

export interface User {
  id: number;
  name: string;
  email: string;
  birthdate: string;
  nDni: number;
  username: string;
}