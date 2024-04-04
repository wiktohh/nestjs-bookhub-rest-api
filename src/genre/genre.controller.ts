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
import { GenreService } from './genre.service';
import { AddGenreDto, EditGenreDto } from './dto';

@Controller('genres')
export class GenreController {
  constructor(private genreService: GenreService) {}

  @Get()
  async getGenres() {
    return await this.genreService.getGenres();
  }

  @Get(':id')
  async getGenre(@Param('id', ParseIntPipe) id: number) {
    return await this.genreService.getGenre(id);
  }

  @Post()
  async addGenre(@Body() dto: AddGenreDto) {
    return await this.genreService.addGenre(dto);
  }

  @Patch(':id')
  async updateGenre(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: EditGenreDto,
  ) {
    return await this.genreService.updateGenre(id, dto);
  }

  @Delete(':id')
  async deleteGenre(@Param('id', ParseIntPipe) id: number) {
    return await this.genreService.deleteGenre(id);
  }
}
