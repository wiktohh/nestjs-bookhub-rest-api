import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { BookService } from './book.service';
import { AddBookDto } from './dto';
import { EditBookDto } from './dto/edit-book.dto';

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

  @Post()
  async addBook(@Body() body: AddBookDto) {
    return await this.bookService.addBook(body);
  }

  @Patch('/:id')
  async updateBook(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: EditBookDto,
  ) {
    return await this.bookService.updateBook(id, body);
  }

  @Delete('/:id')
  async deleteBook(@Param('id', ParseIntPipe) id: number) {
    return await this.bookService.deleteBook(id);
  }
}
