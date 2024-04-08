import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as pactum from 'pactum';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { first } from 'rxjs';

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
      it('should throw if email already exists', () => {
        return pactum
          .spec()
          .post('/auth/sign-up')
          .withBody(dto)
          .expectStatus(400);
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
          .expectStatus(400);
      });
      it('should login a user', () => {
        return pactum
          .spec()
          .post('/auth/sign-in')
          .withBody({ email: dto.email, password: dto.password })
          .expectStatus(201)
          .stores('userAt', 'accessToken');
      });
    });
  });

  describe('Authors', () => {});

  describe('Genres', () => {});

  describe('Books', () => {});

  describe('Reviews', () => {});
});
