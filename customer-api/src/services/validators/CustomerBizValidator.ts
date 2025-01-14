import { Injectable } from '@nestjs/common';
import { ICustomerBizValidator } from './ICustomerBizValidator';
import { BizValidationFailure } from 'src/models/BizValidationFailure';
import { Customer } from 'src/models/Customer';
import { InstanceState } from 'src/models/InstanceState';

@Injectable()
export class CustomerBizValidator
    implements ICustomerBizValidator {
  async validate(customer: Partial<Customer>, state: InstanceState): Promise<BizValidationFailure[]> {
    const validationFailures: BizValidationFailure[] = [];

    if (!customer.firstName || customer.firstName.trim() === '') {
      validationFailures.push(new BizValidationFailure('FirstName', 'First name should not be empty.'));
    }

    if (customer.dateOfBirth && new Date().getFullYear() - new Date(customer.dateOfBirth).getFullYear() < 18) {
      validationFailures.push(new BizValidationFailure('DateOfBirth', 'Customer should be at least 18 years old.'));
    }

    // Applicable, only if the instance is already existing.
    if (state == InstanceState.Existing) {
        if (customer.id === null && customer.id === undefined) {
        validationFailures.push(new BizValidationFailure('Id', 'ID should not be null or undefined for modifications.'));
        }
    }

    return validationFailures;
  }
}