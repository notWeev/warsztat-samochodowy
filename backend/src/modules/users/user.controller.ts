import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';
import { UsersService, type CreateUserDto } from './user.service';
import { User } from './entities/user.entity';

@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Post()
  create(@Body() body: CreateUserDto) {
    return this.users.create(body);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.users.findById(id);
  }

  @Get()
  list() {
    return this.users.list();
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() patch: Partial<User>) {
    return this.users.update(id, patch);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.users.remove(id);
  }
}
