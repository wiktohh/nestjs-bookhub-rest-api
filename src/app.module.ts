import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { BookModule } from './book/book.module';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';
import { AuthorModule } from './author/author.module';
import { GenreModule } from './genre/genre.module';
import { ReviewModule } from './review/review.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    UserModule,
    BookModule,
    AuthorModule,
    GenreModule,
    ReviewModule,
  ],
})
export class AppModule {}
