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
import { AuthorService } from './author.service';
import { AddAuthorDto } from './dto';
import { EditAuthorDto } from './dto/edit-author.dto';

@Controller('authors')
export class AuthorController {
  constructor(private authorService: AuthorService) {}

  @Get()
  async getAuthors() {
    //throw new Error('Not implemented');
    return await this.authorService.getAuthors();
  }

  @Get(':id')
  async getAuthor(@Param('id', ParseIntPipe) id: number) {
    return await this.authorService.getAuthor(id);
  }

  @Post()
  async addAuthor(@Body() dto: AddAuthorDto) {
    return await this.authorService.addAuthor(dto);
  }

  @Patch(':id')
  async updateAuthor(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: EditAuthorDto,
  ) {
    return await this.authorService.updateAuthor(id, dto);
  }

  @Delete(':id')
  async deleteAuthor(@Param('id', ParseIntPipe) id: number) {
    return await this.authorService.deleteAuthor(id);
  }
}
