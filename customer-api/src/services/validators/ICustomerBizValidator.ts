import { BizValidationFailure } from "src/models/BizValidationFailure";
import { Customer } from "src/models/Customer";
import { InstanceState } from "src/models/InstanceState";

export interface ICustomerBizValidator {
  validate(customer: Partial<Customer>, state: InstanceState): Promise<BizValidationFailure[]>;
}