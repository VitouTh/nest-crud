import { INestApplication, ValidationPipe } from '@nestjs/common';
import {Test} from '@nestjs/testing';
import { PrismaService } from '../src/prisma/prisma.service';
import * as pactum from 'pactum';
import { AppModule } from '../src/app.module';
import { AuthDto } from '../src/auth/dto';
import { EditUserDto } from '../src/user/dto';
import { CreateBookmarkDto, EditBookmarkDto } from '../src/bookmark/dto';

describe('App e2e',() => {
  let app : INestApplication;
  let prisma: PrismaService
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        AppModule
      ]
    }).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true
      })
    )

    await app.init();
    await app.listen(3333);

    prisma = app.get(PrismaService)
    await prisma.cleanDb();
    pactum.request.setBaseUrl('http://localhost:3333')
  });

  afterAll(() => {
    app.close()
  })

  describe('Auth',() => {
    const dto: AuthDto = {
      email: 'besttest@email.com',
      password: '123'
    }
    describe('Signup', () => {
      it('should throw if email empty', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({
            password: dto.password
          })
          .expectStatus(400)
      });
      it('should throw if password empty', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({
            email: dto.email
          })
          .expectStatus(400)
      });
      it('should throw if no body', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({
          })
          .expectStatus(400)
      });
      it('should sign up', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody(dto)
          .expectStatus(200)
      })
    });
    describe('Signin', () => {
      it('should throw if email empty', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({
            password: dto.password
          })
          .expectStatus(400)
      });
      it('should throw if password empty', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({
            email: dto.email
          })
          .expectStatus(400)
      });
      it('should throw if no body', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({
          })
          .expectStatus(400)
      });
      it('should sign in', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody(dto)
          .expectStatus(200)
          .stores('userAccessToken', 'access_token');
      })
    });
  })

  describe('User',() => {
    it('Get Current data', () => {
      return pactum
        .spec()
        .get('/user/me')
        .withHeaders({
          Authorization: 'Bearer $S{userAccessToken}'
        })
        .expectStatus(200)
    });
 
    describe('Edit user', () => {
      it('Should Edit data', () => {
        const dto: EditUserDto = {
          firstName: 'testname',
          email: 'testEmail@email.com'
        }
        return pactum
          .spec()
          .patch('/user')
          .withHeaders({
            Authorization: 'Bearer $S{userAccessToken}'
          })
          .withBody(dto)
          .expectStatus(200)
          .expectBodyContains(dto.firstName)
          .expectBodyContains(dto.email)
      })
    })
  })

  describe('Bookmarks',() => {
    describe('Create bookmark', () => {
      const  dto : CreateBookmarkDto = {
        title : 'First Bookmark',
        link: 'https://github.com/vladwulf/nestjs-api-tutorial/blob/main/src/bookmark/bookmark.controller.ts'
      }
      it('should create bookmark', () => {
        return pactum 
          .spec()
          .post('/bookmark')
          .withHeaders({
            Authorization: 'Bearer $S{userAccessToken}'
          })
          .withBody(dto)
          .expectStatus(201)
          .inspect()
      })
    })
    describe('Get Bookmarks', () => {
      it('should return bookmark', () => {
        return pactum
          .spec()
          .get('/bookmark')
          .withHeaders({
            Authorization: 'Bearer $S{userAccessToken}'
          })
          .expectStatus(200)
          .stores('bookmarkId', 'id')
          
      })

    })
    describe('Get Bookmark By Id', () => {
      it('should return bookmark by id', () => {
        return pactum
          .spec()
          .get('/bookmark/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .withHeaders({
            Authorization: 'Bearer $S{userAccessToken}'
          })
          .expectStatus(200)
          
      })
    });

    describe('Edit Bookmark', () => {
      it('should update data', () => {
        const  dto : EditBookmarkDto = {
          title : 'First Edit Bookmark',
          description: 'https://www.youtube.com/watch?v=GHTA143_b-s&t=7963s&ab_channel=freeCodeCamp.org'
        }
        return pactum
          .spec()
          .patch('/bookmark/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .withHeaders({
            Authorization: 'Bearer $S{userAccessToken}'
          })
          .withBody(dto)
          .expectStatus(200)
          .inspect()
      })
    });

    describe('Delete Bookmark', () => {
      it('should delete bookmark', () => {
        return pactum
          .spec()
          .delete('/bookmark/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .withHeaders({
            Authorization: 'Bearer $S{userAccessToken}',
          })
          .expectStatus(204);
      });

      it('should return nothing', () => {
        return pactum
          .spec()
          .get('/bookmark')
          .withHeaders({
            Authorization: 'Bearer $S{userAccessToken}',
          })
          .expectStatus(200)
          .expectJsonLength(0);
      });
    })
  })
});