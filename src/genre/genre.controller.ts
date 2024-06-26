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
import { Role } from '../auth/decorator/role.decorator';
import { JwtGuard } from '../auth/guard/jwt.guard';
import { RoleGuard } from '../auth/guard/role.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Genres')
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
  @ApiBearerAuth()
  @Post()
  async addGenre(@Body() dto: AddGenreDto) {
    return await this.genreService.addGenre(dto);
  }

  @Role('admin')
  @UseGuards(JwtGuard, RoleGuard)
  @ApiBearerAuth()
  @Patch(':id')
  async updateGenre(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: EditGenreDto,
  ) {
    return await this.genreService.updateGenre(id, dto);
  }

  @Role('admin')
  @UseGuards(JwtGuard, RoleGuard)
  @ApiBearerAuth()
  @Delete(':id')
  async deleteGenre(@Param('id', ParseIntPipe) id: number) {
    return await this.genreService.deleteGenre(id);
  }
}
