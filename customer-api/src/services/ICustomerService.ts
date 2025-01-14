import { BizDataResponse } from "src/models/BizDataResponse";
import { BizResponse } from "src/models/BizResponse";
import { Customer } from "src/models/Customer";

export interface ICustomerService {
  addCustomer(newCustomer: Customer): Promise<BizDataResponse<Customer>>;
  modifyCustomer(customer: Customer): Promise<BizResponse>;
  getCustomerById(id: number): Promise<BizDataResponse<Customer>>;
  searchCustomers(query: Partial<Customer>): Promise<BizDataResponse<Customer[]>>;
  deleteCustomer(id: number): Promise<BizResponse>;
}