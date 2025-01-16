import {
    Controller,
    Get, Post, Put, Delete,
    Param, Query, Body, UseGuards,
    HttpStatus, HttpCode,
    Req, Res,
    Inject,
  } from '@nestjs/common';

import { JwtAuthGuard } from 'src/guards/jwtAuthGuard';
import { Roles, RolesGuard } from 'src/guards/rolesGuard';
import { Request, Response } from 'express';
import { Customer } from 'src/models/Customer';
import { ServiceStatus } from 'src/models/ServiceStatus';
import { BizResponse } from 'src/models/BizResponse';
import { ICustomerService } from 'src/services/ICustomerService';

@Controller('customers')
@UseGuards(JwtAuthGuard)
export class CustomerController {
    constructor(@Inject('ICustomerService') private readonly customerService: ICustomerService) {}
        
    // GET matching customers
    // GET /customers?firstName=Tom&lastName=Hank
    @Get()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('api.read')
    async getMatchingCustomers(@Query() query: Partial<Customer>): Promise<Customer[]> {
        const serviceResponse = await this.customerService.searchCustomers(query);

        // Whether you have matching customers or not, the response status code
        // is always 200 - OK for a matching search.
        return serviceResponse.data;
    }

    // GET by ID
    // GET /customers/1
    @Get(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('api.read')
    async getCustomerById(
        @Param('id') id: number,
        @Res() response: Response): Promise<Customer | null> {
        // Call service to get specific customer.
        const serviceResponse = await this.customerService.getCustomerById (id);

        if (!serviceResponse?.data) {
            // Specified customer with the ID does not exist - 404 Not Found.
            response
                .status (HttpStatus.NOT_FOUND)
                .json ({
                    message: `Customer with ID '${id}' could not be found.`
                })
                .send ();
            return;
        }

        // Matching unique customer with ID exists - 200 OK.
        response
            .status (HttpStatus.OK)
            .json (serviceResponse.data)
            .send ();
    }

    // POST to create a new customer
    // POST /customers/
    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('api.createOrModify')
    @HttpCode(201)
    async addCustomer(
            @Body() newCustomer: Customer,
            @Req() request: Request,
            @Res() response: Response)
        : Promise<void> {
        // Call service to create new customer.
        const serviceResponse = await this.customerService.addCustomer (newCustomer);
        
        if (!serviceResponse.isValid ()) {
            // Could not create customer - there are validation errors! 422 Unprocessable Entity.
            response
                .status (HttpStatus.UNPROCESSABLE_ENTITY)
                .json ({
                    message: "Business validations failed for adding new customer.",
                    validationFailures: serviceResponse.validationFailures
                })
                .send ();
            return;
        }

        // Customer could be created. Prepare `Location` response header.
        const location
            = `${request.protocol}://${request.get('host')}/customers/${serviceResponse.data.id}`;

        // 201 - Created.
        response
            .status (HttpStatus.CREATED)
            .location (location)
            .send ();
    }

    // PUT to modify an existing customer
    // PUT /customers/
    @Put()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('api.createOrModify')
    @HttpCode(204)
    async modifyCustomer(
        @Body() existingCustomer: Customer,
        @Res() response: Response): Promise<BizResponse> {
        // Call service to update existing customer.
        const serviceResponse = await this.customerService.modifyCustomer (existingCustomer);

        if (!serviceResponse.isValid ()) {
            // There are validation errors! 422 Unprocessable Entity.
            response
                .status (HttpStatus.UNPROCESSABLE_ENTITY)
                .json ({
                    message: "Business validations failed for modifying existing customer.",
                    validationFailures: serviceResponse.validationFailures
                })
                .send ();
            return;
        }

        // No validation errors, but customer with ID does not exist.
        if (serviceResponse.status == ServiceStatus.SpecificItemNotFound) {
            // 404 - Not Found.
            response
                .status (HttpStatus.NOT_FOUND)
                .json ({
                    message: `Customer with ID '${ existingCustomer.id }' could not be found.`
                })
                .send ();
            return;
        }

        // Customer could be successfully modified - 204 No Content.
        response
            .status (HttpStatus.NO_CONTENT)
            .send ();
    }

    // DELETE by ID
    // DELETE /customers/1
    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('api.deleteOrPurge')
    @HttpCode(204)
    async deleteCustomer(
        @Param('id') id: number,
        @Res() response: Response): Promise<BizResponse> {
        // Call service to delete existing customer.
        const serviceResponse = await this.customerService.deleteCustomer (id);

        if (serviceResponse.status === ServiceStatus.SpecificItemNotFound) {
            // Customer with ID does not exist - 404 Not Found.
            response
                .status (HttpStatus.NOT_FOUND)
                .json ({
                    message: `Customer with ID '${id}' could not be found.`
                })
                .send ();

            return;
        }

        // Customer could be successfully deleted - 204 No Content.
        response
            .status (HttpStatus.NO_CONTENT)
            .send ();
    }
}