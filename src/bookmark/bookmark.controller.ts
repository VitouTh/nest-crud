import { Controller, UseGuards, Get, Post,Patch, Delete, ParseIntPipe , Param, Body, HttpCode, HttpStatus} from '@nestjs/common';
import { BookmarkService } from './bookmark.service';
import { JwtGuard } from '../auth/guard';
import { GetUser } from '../auth/decorator';
import { CreateBookmarkDto, EditBookmarkDto } from './dto';

@UseGuards(JwtGuard)
@Controller('bookmark')
export class BookmarkController {
    constructor(
        private bookmarkService: BookmarkService
    ){}

    @Get()
    getBookmarks(@GetUser('id') userId:number){
        return this.bookmarkService.getBookmarks(
            userId
        );
    }

    @Get(':id')
    getBookmarkById(@GetUser('id') userId:number, @Param('id', ParseIntPipe) bookmarkId:number){
        return this.bookmarkService.getBookmarksById(
                userId, bookmarkId
        )
    }

    @Post()
    createBookmark(@GetUser('id') userId:number, @Body() dto: CreateBookmarkDto){
        return this.bookmarkService.createBookmark(
                userId, dto
        )
    }

    @Patch(':id')
    editBookmarkById(@GetUser('id') userId:number, @Param('id', ParseIntPipe) bookmarkId:number, @Body() dto: EditBookmarkDto   ){
        return this.bookmarkService.editBookmarkById(
            userId, bookmarkId, dto
        )
    }

    @HttpCode(HttpStatus.NO_CONTENT)
    @Delete(':id')
    deleteBookmarkById(@GetUser('id') userId:number, @Param('id', ParseIntPipe) bookmarkId:number){
        return this.bookmarkService.deleteBookmarkById(userId, bookmarkId)
    }
}
