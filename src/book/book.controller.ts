import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { BookService } from './book.service';
import { AddBookDto } from './dto';
import { EditBookDto } from './dto/edit-book.dto';
import { RoleGuard } from '../auth/guard/role.guard';
import { JwtGuard } from '../auth/guard/jwt.guard';
import { Role } from '../auth/decorator/role.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Books')
@Controller('/books')
export class BookController {
  constructor(private bookService: BookService) {}

  @Get()
  async getBooks() {
    return await this.bookService.getBooks();
  }

  @Get('/:id')
  async getBook(@Param('id', ParseIntPipe) id: number) {
    return await this.bookService.getBook(id);
  }

  @Role('admin')
  @UseGuards(JwtGuard, RoleGuard)
  @ApiBearerAuth()
  @Post()
  async addBook(@Body() body: AddBookDto) {
    return await this.bookService.addBook(body);
  }

  @Role('admin')
  @UseGuards(JwtGuard, RoleGuard)
  @ApiBearerAuth()
  @Patch('/:id')
  async updateBook(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: EditBookDto,
  ) {
    return await this.bookService.updateBook(id, body);
  }

  @Role('admin')
  @UseGuards(JwtGuard, RoleGuard)
  @ApiBearerAuth()
  @Delete('/:id')
  async deleteBook(@Param('id', ParseIntPipe) id: number) {
    return await this.bookService.deleteBook(id);
  }
}
