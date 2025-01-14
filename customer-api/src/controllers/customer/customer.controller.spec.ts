import { Test, TestingModule } from '@nestjs/testing';
import { CustomerController } from './customer.controller';
import { ICustomerService } from 'src/services/ICustomerService';
import { Customer } from 'src/models/Customer';
import { HttpStatus } from '@nestjs/common';
// import { ServiceStatus } from 'src/models/ServiceStatus';
import { ServiceStatus } from '@models/ServiceStatus';

describe('CustomerController', () => {
  let controller: CustomerController;
  let service: ICustomerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CustomerController],
      providers: [
        { provide: 'ICustomerService', useValue: {} },  // Mocking ICustomerService
      ],
    }).compile();

    controller = module.get<CustomerController>(CustomerController);
    service = module.get<ICustomerService>('ICustomerService');
  });

  describe('getMatchingCustomers', () => {
    it('should return a list of matching customers', async () => {
      // Mock the ICustomerService's searchCustomers method
      const mockCustomers: Customer[] = [
        {
          id: 1,
          firstName: 'John',
          lastName: 'Doe',
          dateOfBirth: new Date(1990, 5, 15),
          email: 'john.doe@example.com',
          mobilePhoneNumber: '1234567890',
          ssn: '123-45-6789', // Added SSN
        },
        {
          id: 2,
          firstName: 'Jane',
          lastName: 'Smith',
          dateOfBirth: new Date(1985, 8, 25),
          email: 'jane.smith@example.com',
          mobilePhoneNumber: '0987654321',
          ssn: '987-65-4321', // Added SSN
        },
      ];

      jest
        .spyOn(service, 'searchCustomers')
        .mockResolvedValue({
          status: ServiceStatus.MatchingItemsFound,
          data: mockCustomers,
          validationFailures:null,
          isValid() {
              return true;
          },
        });

      const query = { firstName: 'Bob', lastName: 'Smith' };
      const result = await controller.getMatchingCustomers(query);

      expect(result).toEqual(mockCustomers);
      expect((result as any).status).toBe(HttpStatus.OK);
    });

    it('should return an empty list if no matching customers', async () => {
      jest
        .spyOn(service, 'searchCustomers')
        .mockResolvedValue({
          status: ServiceStatus.MatchingItemsNotFound,
          data: [],
          validationFailures:null,
          isValid() {
              return true;
          },
        });

      const query = { firstName: 'John', lastName: 'Doe' };
      const result = await controller.getMatchingCustomers(query);

      expect(result).toEqual([]);
      expect((result as any).status).toBe(HttpStatus.OK);
    });
  });
});
