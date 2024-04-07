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
import { GenreService } from './genre.service';
import { AddGenreDto, EditGenreDto } from './dto';
import { Role } from 'src/auth/decorator/role.decorator';
import { JwtGuard } from 'src/auth/guard/jwt.guard';
import { RoleGuard } from 'src/auth/guard/role.guard';

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

  @Role('admin')
  @UseGuards(JwtGuard, RoleGuard)
  @Post()
  async addGenre(@Body() dto: AddGenreDto) {
    return await this.genreService.addGenre(dto);
  }

  @Role('admin')
  @UseGuards(JwtGuard, RoleGuard)
  @Patch(':id')
  async updateGenre(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: EditGenreDto,
  ) {
    return await this.genreService.updateGenre(id, dto);
  }

  @Role('admin')
  @UseGuards(JwtGuard, RoleGuard)
  @Delete(':id')
  async deleteGenre(@Param('id', ParseIntPipe) id: number) {
    return await this.genreService.deleteGenre(id);
  }
}
