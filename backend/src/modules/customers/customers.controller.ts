import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { CustomerType } from './entities/customer.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@Controller('customers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  /**
   * POST /customers
   * Tworzy nowego klienta
   * Dostępne dla: ADMIN, MANAGER, RECEPTION
   */
  @Post()
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.RECEPTION)
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createCustomerDto: CreateCustomerDto) {
    return this.customersService.create(createCustomerDto);
  }

  /**
   * GET /customers
   * Pobiera listę klientów z paginacją i wyszukiwaniem
   * Dostępne dla: wszyscy zalogowani
   */
  @Get()
  findAll(
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 10,
    @Query('search') search?: string,
    @Query('type') type?: string,
  ) {
    const customerType =
      type && Object.values(CustomerType).includes(type as CustomerType)
        ? (type as CustomerType)
        : undefined;

    return this.customersService.findAll(page, limit, search, customerType);
  }

  /**
   * GET /customers/stats
   * Pobiera statystyki klientów
   * Dostępne dla: ADMIN, MANAGER
   */
  @Get('stats')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  getStats() {
    return this.customersService.getStats();
  }

  /**
   * GET /customers/:id
   * Pobiera szczegóły klienta
   * Dostępne dla: wszyscy zalogowani
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.customersService.findOne(id);
  }

  /**
   * PATCH /customers/:id
   * Aktualizuje dane klienta
   * Dostępne dla: ADMIN, MANAGER, RECEPTION
   */
  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.RECEPTION)
  update(
    @Param('id') id: string,
    @Body() updateCustomerDto: UpdateCustomerDto,
  ) {
    return this.customersService.update(id, updateCustomerDto);
  }

  /**
   * DELETE /customers/:id
   * Usuwa klienta
   * Dostępne dla: ADMIN
   */
  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.customersService.remove(id);
  }
}
