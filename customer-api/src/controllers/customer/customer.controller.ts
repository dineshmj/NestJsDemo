import {
    Controller,
    Get, Post, Put, Delete,
    Param, Query, Body,
    HttpStatus, HttpCode,
    Req, Res,
    Inject,
  } from '@nestjs/common';
import { Request, Response } from 'express';
import { BizResponse } from 'src/models/BizResponse';
import { Customer } from 'src/models/Customer';
import { ServiceStatus } from 'src/models/ServiceStatus';
import { ICustomerService } from 'src/services/ICustomerService';

@Controller('customers')
export class CustomerController {
    constructor(@Inject('ICustomerService') private readonly customerService: ICustomerService) {
    }
        
    // GET matching customers
    @Get()
    async getMatchingCustomers(@Query() query: Partial<Customer>): Promise<Customer[]> {
        const serviceResponse = await this.customerService.searchCustomers(query);
        return serviceResponse.data;
    }

    // GET by ID
    @Get(':id')
    async getCustomerById(
        @Param('id') id: number,
        @Res() response: Response): Promise<Customer | null> {
        // Call service to get specific customer.
        const serviceResponse = await this.customerService.getCustomerById (id);

        if (!serviceResponse?.data) {
            response
                .status (HttpStatus.NOT_FOUND)
                .json ({
                    message: `Customer with ID '${id}' could not be found.`
                })
                .send ();

            return;
        }

        response
            .status (HttpStatus.OK)
            .json (serviceResponse.data)
            .send ();
    }

    // POST to create a new customer
    @Post()
    @HttpCode(201)
    async addCustomer(
            @Body() newCustomer: Customer,
            @Req() request: Request,
            @Res() response: Response)
        : Promise<void> {
        // Call service to create new customer.
        const serviceResponse = await this.customerService.addCustomer (newCustomer);
        
        if (!serviceResponse.isValid ()) {
            response
                .status (HttpStatus.UNPROCESSABLE_ENTITY)
                .json ({
                    message: "Business validations failed for adding new customer.",
                    validationFailures: serviceResponse.validationFailures
                })
                .send ();

            return;
        }

        const location = `${request.protocol}://${request.get('host')}/customers/${serviceResponse.data.id}`;

        response
            .status (HttpStatus.CREATED)
            .location (location)
            .send ();
    }

    // PUT to modify an existing customer
    @Put()
    @HttpCode(204)
    async modifyCustomer(
        @Body() existingCustomer: Customer,
        @Res() response: Response): Promise<BizResponse> {
        // Call service to update existing customer.
        const serviceResponse = await this.customerService.modifyCustomer (existingCustomer);

        if (!serviceResponse.isValid ()) {
            response
                .status (HttpStatus.UNPROCESSABLE_ENTITY)
                .json ({
                    message: "Business validations failed for modifying existing customer.",
                    validationFailures: serviceResponse.validationFailures
                })
                .send ();

            return;
        }

        if (serviceResponse.status == ServiceStatus.SpecificItemNotFound) {
            response
                .status (HttpStatus.NOT_FOUND)
                .json ({
                    message: `Customer with ID '${ existingCustomer.id }' could not be found.`
                })
                .send ();

            return;
        }

        response
            .status (HttpStatus.NO_CONTENT)
            .send ();
    }

    // DELETE by ID
    @Delete(':id')
    @HttpCode(204)
    async deleteCustomer(
        @Param('id') id: number,
        @Res() response: Response): Promise<BizResponse> {
        // Call service to delete existing customer.
        const serviceResponse = await this.customerService.deleteCustomer (id);

        if (serviceResponse.status === ServiceStatus.SpecificItemNotFound) {
            response
                .status (HttpStatus.NOT_FOUND)
                .json ({
                    message: `Customer with ID '${id}' could not be found.`
                })
                .send ();

            return;
        }

        response
            .status (HttpStatus.NO_CONTENT)
            .send ();
    }
}