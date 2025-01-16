import { Injectable, Inject } from '@nestjs/common';
import { BizResponse, ServiceStatus } from '../models/BizResponse';
import { BizDataResponse } from 'src/models/BizDataResponse';
import { InstanceState } from 'src/models/InstanceState';
import { Customer } from '../models/Customer';
import { ICustomerBizValidator } from './validators/ICustomerBizValidator';
import { ICustomerService } from './ICustomerService';

@Injectable()
export class CustomerService
  implements ICustomerService {
  private customers: Customer[] = [
    {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      dateOfBirth: new Date(1990, 5, 15),
      email: 'john.doe@example.com',
      mobilePhoneNumber: '1234567890',
      ssn: '123-45-6789'
    },
    {
      id: 2,
      firstName: 'Jane',
      lastName: 'Smith',
      dateOfBirth: new Date(1985, 8, 25),
      email: 'jane.smith@example.com',
      mobilePhoneNumber: '0987654321',
      ssn: '987-65-4321'
    },
    {
      id: 3,
      firstName: 'Alice',
      lastName: 'Johnson',
      dateOfBirth: new Date(1995, 2, 10),
      email: 'alice.johnson@example.com',
      mobilePhoneNumber: '5555555555',
      ssn: '111-22-3333'
    },
    {
      id: 4,
      firstName: 'Bob',
      lastName: 'Brown',
      dateOfBirth: new Date(2000, 10, 30),
      email: 'bob.brown@example.com',
      mobilePhoneNumber: '4444444444',
      ssn: '222-33-4444'
    },
  ];

  private nextId = 5;

  constructor(@Inject('ICustomerBizValidator') private readonly validator: ICustomerBizValidator) {
  }

  //
  // Add new customer.
  //
  async addCustomer(newCustomer: Customer): Promise<BizDataResponse<Customer>> {
    // Business validation
    const validationFailures = await this.validator.validate (newCustomer, InstanceState.New);

    if (validationFailures.length > 0) {
      return new BizDataResponse(validationFailures, null);
    }

    // Add customer
    newCustomer.id = this.nextId++;
    this.customers.push(newCustomer);

    return new BizDataResponse(ServiceStatus.Created, newCustomer);
  }

  //
  // Modify existing customer.
  //
  async modifyCustomer(customer: Customer): Promise<BizResponse> {
    // Business validation
    const validationFailures = await this.validator.validate(customer, InstanceState.Existing);

    if (validationFailures.length > 0) {
      return new BizResponse(validationFailures);
    }

    // Find and update the customer
    const index = this.customers.findIndex((c) => c.id === customer.id);

    if (index === -1) {
      return new BizResponse(ServiceStatus.SpecificItemNotFound);
    }

    this.customers[index] = customer;
    return new BizResponse(ServiceStatus.Modified);
  }

  //
  // Get the specific customer whose ID is provided.
  //
  async getCustomerById(id: number): Promise<BizDataResponse<Customer>> {
    const customer = this.customers.find(c => c.id === +id);

    if (!customer) {
      return new BizDataResponse(
        ServiceStatus.SpecificItemNotFound,
        customer
      );
    }

    return new BizDataResponse(ServiceStatus.SpecificItemFound, customer);
  }

  //
  // Get a list of matching customers to the search criteria specified.
  //
  async searchCustomers(query: Partial<Customer>): Promise<BizDataResponse<Customer[]>> {
    const matchingCustomers = this.customers.filter((customer) => {
      return Object.keys(query).every((key) =>
        (customer as any)[key]?.toString().includes((query as any)[key]),
      );
    });

    if (matchingCustomers.length === 0) {
      return new BizDataResponse(ServiceStatus.MatchingItemsNotFound, []);
    }

    return new BizDataResponse(ServiceStatus.MatchingItemsFound, matchingCustomers);
  }

  //
  // Delete an existing customer whose ID is provided.
  //
  async deleteCustomer(id: number): Promise<BizResponse> {
    const index = this.customers.findIndex(c => c.id === +id);
    
    if (index === -1) {
      return new BizResponse(ServiceStatus.SpecificItemNotFound);
    }

    this.customers.splice(index, 1);

    return new BizResponse(ServiceStatus.Deleted);
  }
}