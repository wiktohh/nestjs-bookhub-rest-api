import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as pactum from 'pactum';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { first } from 'rxjs';
import { AuthorController } from 'src/author/author.controller';
import { before } from 'node:test';

describe('App (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );
    await app.init();
    await app.listen(3333);

    prismaService = app.get(PrismaService);
    await prismaService.cleanDb();
    pactum.request.setBaseUrl('http://localhost:3333');
  });

  afterAll(() => {
    app.close();
  });

  describe('Auth', () => {
    const dto = {
      email: 'test@test.pl',
      firstName: 'Test',
      lastName: 'Test',
      password: 'test1234',
    };
    const adminDto = {
      email: 'admin@test.pl',
      firstName: 'Admin',
      lastName: 'Admin',
      password: 'admin1234',
      role: 'ADMIN',
    };
    describe('Register', () => {
      it('should throw if email empty', () => {
        return pactum
          .spec()
          .post('/auth/sign-up')
          .withBody({ ...dto, email: '' })
          .expectStatus(400);
      });
      it('should throw if password empty', () => {
        return pactum
          .spec()
          .post('/auth/sign-up')
          .withBody({ ...dto, password: '' })
          .expectStatus(400);
      });
      it('should throw if firstName empty', () => {
        return pactum
          .spec()
          .post('/auth/sign-up')
          .withBody({ ...dto, firstName: '' })
          .expectStatus(400);
      });
      it('should throw if lastName empty', () => {
        return pactum
          .spec()
          .post('/auth/sign-up')
          .withBody({ ...dto, lastName: '' })
          .expectStatus(400);
      });
      it('should throw if password too short', () => {
        return pactum
          .spec()
          .post('/auth/sign-up')
          .withBody({ ...dto, password: '1234' })
          .expectStatus(400);
      });
      it("should throw if email doesn't match email pattern", () => {
        return pactum
          .spec()
          .post('/auth/sign-up')
          .withBody({ ...dto, email: 'test' })
          .expectStatus(400);
      });
      it('should throw if no body provided', () => {
        return pactum.spec().post('/auth/sign-up').expectStatus(400);
      });
      it('should register a new user', () => {
        return pactum
          .spec()
          .post('/auth/sign-up')
          .withBody(dto)
          .expectStatus(201);
      });
      it('should register a new admin', () => {
        return pactum
          .spec()
          .post('/auth/sign-up')
          .withBody(adminDto)
          .expectStatus(201);
      });
      it('should throw if email already exists', () => {
        return pactum
          .spec()
          .post('/auth/sign-up')
          .withBody(dto)
          .expectStatus(401);
      });
    });
    describe('Login', () => {
      it('should throw if email empty', () => {
        return pactum
          .spec()
          .post('/auth/sign-in')
          .withBody({ ...dto, email: '' })
          .expectStatus(400);
      });
      it('should throw if password empty', () => {
        return pactum
          .spec()
          .post('/auth/sign-in')
          .withBody({ ...dto, password: '' })
          .expectStatus(400);
      });
      it('should throw if no body provided', () => {
        return pactum.spec().post('/auth/sign-in').expectStatus(400);
      });
      it("should throw if email doesn't match email pattern", () => {
        return pactum
          .spec()
          .post('/auth/sign-in')
          .withBody({ ...dto, email: 'test' })
          .expectStatus(400);
      });
      it('should throw if user not found', () => {
        return pactum
          .spec()
          .post('/auth/sign-in')
          .withBody({ email: 'email@wp.pl' })
          .expectStatus(400);
      });
      it('should throw if password is incorrect', () => {
        return pactum
          .spec()
          .post('/auth/sign-in')
          .withBody({ email: dto.email, password: 'wrongPassword' })
          .expectStatus(401);
      });
      it('should login a user', () => {
        return pactum
          .spec()
          .post('/auth/sign-in')
          .withBody({ email: dto.email, password: dto.password })
          .expectStatus(201)
          .stores('userToken', 'accessToken');
      });
      it('should login a admin', () => {
        return pactum
          .spec()
          .post('/auth/sign-in')
          .withBody({ email: adminDto.email, password: adminDto.password })
          .expectStatus(201)
          .stores('adminToken', 'accessToken');
      });
    });
  });

  describe('Authors', () => {
    describe('POST /authors', () => {
      it('should throw if no token provided', () => {
        return pactum.spec().post('/authors').expectStatus(401);
      });
      it('should throw if no body provided', () => {
        return pactum
          .spec()
          .post('/authors')
          .withHeaders({
            Authorization: `Bearer $S{adminToken}`,
          })
          .expectStatus(400);
      });
      it('should throw if name empty', () => {
        return pactum
          .spec()
          .post('/authors')
          .withHeaders({
            Authorization: `Bearer $S{adminToken}`,
          })
          .expectStatus(400);
      });
      it('should throw if user try to add a new author', () => {
        return pactum
          .spec()
          .post('/authors')
          .withHeaders({
            Authorization: `Bearer $S{userToken}`,
          })
          .withBody({ name: 'Jan Kowalski' })
          .expectStatus(403);
      });
      it('should admin add new author', () => {
        return pactum
          .spec()
          .post('/authors')
          .withHeaders({
            Authorization: `Bearer $S{adminToken}`,
          })
          .withBody({ name: 'Jan Kowalski' })
          .expectStatus(201);
      });
    });
    describe('GET /authors', () => {
      it('should return authors', () => {
        return pactum.spec().get('/authors').expectStatus(200);
      });
    });
    describe('GET /authors/:id', () => {
      it('should return author', () => {
        return pactum.spec().get('/authors/1').expectStatus(200);
      });
      it('should throw if author not found', () => {
        return pactum.spec().get('/authors/999').expectStatus(404);
      });
    });
    describe('PATCH /authors/:id', () => {
      it('should throw if no token provided', () => {
        return pactum.spec().patch('/authors/1').expectStatus(401);
      });
      it('should throw if name empty', () => {
        return pactum
          .spec()
          .patch('/authors/1')
          .withHeaders({
            Authorization: `Bearer $S{adminToken}`,
          })
          .expectStatus(400);
      });
      it('should throw if user try to update author', () => {
        return pactum
          .spec()
          .patch('/authors/1')
          .withHeaders({
            Authorization: `Bearer $S{userToken}`,
          })
          .withBody({ name: 'Jan Nowak' })
          .expectStatus(403);
      });
      it('should update author', () => {
        return pactum
          .spec()
          .patch('/authors/1')
          .withHeaders({
            Authorization: `Bearer $S{adminToken}`,
          })
          .withBody({ name: 'Jan Nowak' })
          .expectStatus(200);
      });
      it('should throw if author not found', () => {
        return pactum
          .spec()
          .patch('/authors/999')
          .withHeaders({
            Authorization: `Bearer $S{adminToken}`,
          })
          .withBody({ name: 'Jan Nowak' })
          .expectStatus(404);
      });
    });
    describe('DELETE /authors/:id', () => {
      it('should throw if no token provided', () => {
        return pactum.spec().delete('/authors/1').expectStatus(401);
      });
      it('should throw if author doesnt found', () => {
        return pactum
          .spec()
          .delete('/authors/999')
          .withHeaders({
            Authorization: `Bearer $S{adminToken}`,
          })
          .expectStatus(404);
      });
      it('should throw if user try to delete author', () => {
        return pactum
          .spec()
          .delete('/authors/1')
          .withHeaders({
            Authorization: `Bearer $S{userToken}`,
          })
          .expectStatus(403);
      });
      it('should delete author', () => {
        return pactum
          .spec()
          .delete('/authors/1')
          .withHeaders({
            Authorization: `Bearer $S{adminToken}`,
          })
          .expectStatus(200);
      });
    });
  });

  describe('Genres', () => {
    describe('POST /genres', () => {
      it('should throw if no token provided', () => {
        return pactum
          .spec()
          .post('/genres')
          .withBody({ name: 'Fantasy' })
          .expectStatus(401);
      });
      it('should throw if no body provided', () => {
        return pactum
          .spec()
          .post('/genres')
          .withHeaders({
            Authorization: `Bearer $S{adminToken}`,
          })
          .expectStatus(400);
      });
      it('should throw if user try to add genre', () => {
        return pactum
          .spec()
          .post('/genres')
          .withHeaders({
            Authorization: `Bearer $S{userToken}`,
          })
          .withBody({ name: 'Fantasy' })
          .expectStatus(403);
      });
      it('should add genre', () => {
        return pactum
          .spec()
          .post('/genres')
          .withHeaders({
            Authorization: `Bearer $S{adminToken}`,
          })
          .withBody({ name: 'Fantasy' })
          .expectStatus(201);
      });
    });
    describe('GET /genres', () => {
      it('should return genres', () => {
        return pactum.spec().get('/genres').expectStatus(200);
      });
    });
    describe('GET /genres/:id', () => {
      it('should return genre', () => {
        return pactum.spec().get('/genres/1').expectStatus(200);
      });
      it('should throw if genre not found', () => {
        return pactum.spec().get('/genres/999').expectStatus(404);
      });
    });
    describe('PATCH /genres/:id', () => {
      it('should throw if no token provided', () => {
        return pactum.spec().patch('/genres/1').expectStatus(401);
      });
      it('should throw if name empty', () => {
        return pactum
          .spec()
          .patch('/genres/1')
          .withHeaders({
            Authorization: `Bearer $S{adminToken}`,
          })
          .expectStatus(400);
      });
      it('should throw if genre doesnt found', () => {
        return pactum
          .spec()
          .patch('/genres/999')
          .withHeaders({
            Authorization: `Bearer $S{adminToken}`,
          })
          .withBody({ name: 'Horror' })
          .expectStatus(404);
      });
      it('should throw if user try to update genre', () => {
        return pactum
          .spec()
          .patch('/genres/1')
          .withHeaders({
            Authorization: `Bearer $S{userToken}`,
          })
          .withBody({ name: 'Horror' })
          .expectStatus(403);
      });
      it('should update genre', () => {
        return pactum
          .spec()
          .patch('/genres/1')
          .withHeaders({
            Authorization: `Bearer $S{adminToken}`,
          })
          .withBody({ name: 'Horror' })
          .expectStatus(200);
      });
    });
    describe('DELETE /genres/:id', () => {
      it('should throw if no token provided', () => {
        return pactum.spec().delete('/genres/1').expectStatus(401);
      });
      it('should throw if genre doesnt found', () => {
        return pactum
          .spec()
          .delete('/genres/999')
          .withHeaders({
            Authorization: `Bearer $S{adminToken}`,
          })
          .withBody({ name: 'Horror' })
          .expectStatus(404);
      });
      it('should throw if user try to delete genre', () => {
        return pactum
          .spec()
          .delete('/genres/1')
          .withHeaders({
            Authorization: `Bearer $S{userToken}`,
          })
          .expectStatus(403);
      });
      it('should delete genre', () => {
        return pactum
          .spec()
          .delete('/genres/1')
          .withHeaders({
            Authorization: `Bearer $S{adminToken}`,
          })
          .expectStatus(200);
      });
    });
  });

  describe('Books', () => {
    beforeAll(async () => {
      await pactum
        .spec()
        .post('/authors')
        .withHeaders({
          Authorization: `Bearer $S{adminToken}`,
        })
        .withBody({ name: 'Jan Kowalski' })
        .expectStatus(201);
    });
    describe('POST /books', () => {
      it('should throw if no token provided', () => {
        return pactum
          .spec()
          .post('/books')
          .withBody({
            title: 'Harry Potter',
            author: 'Jan Kowalski',
          })
          .expectStatus(401);
      });
      it('should throw if no body provided', () => {
        return pactum
          .spec()
          .post('/books')
          .withHeaders({
            Authorization: `Bearer $S{adminToken}`,
          })
          .expectStatus(400);
      });
      it("should throw if author doesn't exists", () => {
        return pactum
          .spec()
          .post('/books')
          .withHeaders({
            Authorization: `Bearer $S{adminToken}`,
          })
          .withBody({
            title: 'Harry Potter',
            author: 'XDwadawdawdaw',
          })
          .expectStatus(404);
      });
      it('should throw if user try to add book', () => {
        return pactum
          .spec()
          .post('/books')
          .withHeaders({
            Authorization: `Bearer $S{userToken}`,
          })
          .withBody({
            title: 'Harry Potter',
            author: 'Jan Kowalski',
          })
          .expectStatus(403);
      });
      it('should add book', () => {
        return pactum
          .spec()
          .post('/books')
          .withHeaders({
            Authorization: `Bearer $S{adminToken}`,
          })
          .withBody({
            title: 'Harry Potter',
            author: 'Jan Kowalski',
          })
          .expectStatus(201);
      });
    });
    describe('GET /books', () => {
      it('should return books', () => {
        return pactum.spec().get('/books').expectStatus(200);
      });
    });
    describe('GET /books/:id', () => {
      it('should return book', () => {
        return pactum.spec().get('/books/1').expectStatus(200);
      });
      it('should throw if book not found', () => {
        return pactum.spec().get('/books/999').expectStatus(404);
      });
    });
    describe('patch /books/:id', () => {
      it('should throw if no token provided', () => {
        return pactum.spec().patch('/books/1').expectStatus(401);
      });
      it('should throw if no body provided', () => {
        return pactum
          .spec()
          .patch('/books/1')
          .withHeaders({
            Authorization: `Bearer $S{adminToken}`,
          })
          .expectStatus(401);
      });
      it('should throw if user try to update book', () => {
        return pactum
          .spec()
          .patch('/books/1')
          .withHeaders({
            Authorization: `Bearer $S{userToken}`,
          })
          .withBody({
            title: 'Dziady cz3',
            author: 'Jan Kowalski',
          })
          .expectStatus(403);
      });
      it("should throw if author doesn't exists", () => {
        return pactum
          .spec()
          .patch('/books/1')
          .withHeaders({
            Authorization: `Bearer $S{adminToken}`,
          })
          .withBody({
            title: 'Wladca Pierscieni',
            author: 'DoesntExitThisAuthor',
          })
          .expectStatus(404);
      });
      it('should update book', () => {
        return pactum
          .spec()
          .patch('/books/1')
          .withHeaders({
            Authorization: `Bearer $S{adminToken}`,
          })
          .withBody({
            title: 'Dziady cz3',
            author: 'Jan Kowalski',
          })
          .expectStatus(200);
      });
    });
  });

  describe('Reviews', () => {
    beforeAll(async () => {
      await pactum
        .spec()
        .post('/books')
        .withHeaders({
          Authorization: `Bearer $S{adminToken}`,
        })
        .withBody({
          title: 'Harry Potter',
          author: 'Jan Kowalski',
        });
    });
    describe('POST /books/:bookId/reviews', () => {
      it('should throw if no token provided', () => {
        return pactum
          .spec()
          .post('/books/1/reviews')
          .withBody({
            rating: 5,
            comment: 'Great book!',
          })
          .expectStatus(401);
      });
      it('should throw if no body provided', () => {
        return pactum
          .spec()
          .post('/books/1/reviews')
          .withHeaders({
            Authorization: `Bearer $S{adminToken}`,
          })
          .expectStatus(400);
      });
      it('should throw if rating is not a number', () => {
        return pactum
          .spec()
          .post('/books/1/reviews')
          .withHeaders({
            Authorization: `Bearer $S{adminToken}`,
          })
          .withBody({
            rating: 'XD',
            comment: 'Great book!',
          })
          .expectStatus(400);
      });
      it('should throw if rating is not between 1 and 5', () => {
        return pactum
          .spec()
          .post('/books/1/reviews')
          .withHeaders({
            Authorization: `Bearer $S{adminToken}`,
          })
          .withBody({
            rating: 6,
            comment: 'Great book!',
          })
          .expectStatus(400);
      });
      it('should add review', () => {
        return pactum
          .spec()
          .post('/books/1/reviews')
          .withHeaders({
            Authorization: `Bearer $S{adminToken}`,
          })
          .withBody({
            rating: 5,
            comment: 'Great book!',
          })
          .expectStatus(201);
      });
    });
    describe('GET /books/:bookId/reviews', () => {
      it("should throw if book doesn't exists", () => {
        return pactum.spec().get('/books/999/reviews').expectStatus(404);
      });
      it('should return reviews', () => {
        return pactum.spec().get('/books/1/reviews').expectStatus(200);
      });
    });
    describe('GET /books/:bookId/reviews/:id', () => {
      it('should return review', () => {
        return pactum.spec().get('/books/1/reviews/1').expectStatus(200);
      });
      it('should throw if book not found', () => {
        return pactum.spec().get('/books/999/reviews/1').expectStatus(404);
      });
      it('should throw if review not found', () => {
        return pactum.spec().get('/books/1/reviews/999').expectStatus(404);
      });
    });
    describe('PATCH /books/:bookId/reviews/:id', () => {
      it('should throw if no token provided', () => {
        return pactum.spec().patch('/books/1/reviews/1').expectStatus(401);
      });
      it('should throw if no body provided', () => {
        return pactum
          .spec()
          .patch('/books/1/reviews/1')
          .withHeaders({
            Authorization: `Bearer $S{adminToken}`,
          })
          .expectStatus(401);
      });
      it('should throw if user try to update not his review', () => {
        return pactum
          .spec()
          .patch('/books/1/reviews/1')
          .withHeaders({
            Authorization: `Bearer $S{userToken}`,
          })
          .withBody({
            rating: 5,
            comment: 'Great book!',
          })
          .expectStatus(403);
      });
      it('should update review', () => {
        return pactum
          .spec()
          .patch('/books/1/reviews/1')
          .withHeaders({
            Authorization: `Bearer $S{adminToken}`,
          })
          .withBody({
            rating: 4,
            comment: 'Great book!',
          })
          .expectStatus(200);
      });
      it('should throw if review not found', () => {
        return pactum
          .spec()
          .patch('/books/1/reviews/999')
          .withHeaders({
            Authorization: `Bearer $S{adminToken}`,
          })
          .withBody({
            rating: 4,
            comment: 'Great book!',
          })
          .expectStatus(404);
      });
      it('should throw if book not found', () => {
        return pactum
          .spec()
          .patch('/books/999/reviews/1')
          .withHeaders({
            Authorization: `Bearer $S{adminToken}`,
          })
          .withBody({
            rating: 4,
            comment: 'Great book!',
          })
          .expectStatus(404);
      });
    });
    describe('DELETE /books/:bookId/reviews/:id', () => {
      it("should throw if book doesn't exists", () => {
        return pactum
          .spec()
          .delete('/books/999/reviews/1')
          .withHeaders({
            Authorization: `Bearer $S{adminToken}`,
          })
          .expectStatus(404);
      });
      it('should throw if review not found', () => {
        return pactum
          .spec()
          .delete('/books/1/reviews/999')
          .withHeaders({
            Authorization: `Bearer $S{adminToken}`,
          })
          .expectStatus(404);
      });
      it('should throw if no token provided', () => {
        return pactum.spec().delete('/books/1/reviews/1').expectStatus(401);
      });
      it('should throw if user try to delete not his review', () => {
        return pactum
          .spec()
          .delete('/books/1/reviews/1')
          .withHeaders({
            Authorization: `Bearer $S{userToken}`,
          })
          .expectStatus(403);
      });
      it('should delete review', () => {
        return pactum
          .spec()
          .delete('/books/1/reviews/1')
          .withHeaders({
            Authorization: `Bearer $S{adminToken}`,
          })
          .expectStatus(200);
      });
    });
  });
});
