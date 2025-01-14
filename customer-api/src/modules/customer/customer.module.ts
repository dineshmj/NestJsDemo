import { Module } from '@nestjs/common';
import { CustomerController } from 'src/controllers/customer/customer.controller';
import { ICustomerService } from 'src/services/ICustomerService';
import { CustomerService } from 'src/services/CustomerService';
import { CustomerBizValidator } from 'src/services/validators/CustomerBizValidator';

@Module({
  controllers: [CustomerController],
  providers: [
    { provide: 'ICustomerService', useClass: CustomerService },
    { provide: 'ICustomerBizValidator', useClass: CustomerBizValidator },
  ],
  exports: ['ICustomerService'], // Export if used in other modules
})
export class CustomerModule {}