import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  Query,
  UseGuards,
  UploadedFiles,
  UseInterceptors,
  Request,
} from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { JwtAuthGuard } from 'src/common/guards';

interface PostRequest extends Request {
  user: {
    sub: string;
    id: string;
  };
}

@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  /**
   * Получение списка постов с пагинацией и сортировкой
   */
  @Get()
  async findAll(
    @Query('limit') limit = 10,
    @Query('offset') offset = 0,
    @Query('sortBy') sortBy = 'createdAt',
  ) {
    return this.postService.findAll(limit, offset, sortBy);
  }

  /**
   * Получение одного поста по ID
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.postService.findOne(id);
  }

  /**
   * Создание нового поста
   */
  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(
    FilesInterceptor('images', 5, {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          const filename = `${file.fieldname}-${uniqueSuffix}${ext}`;
          callback(null, filename);
        },
      }),
    }),
  )
  async create(
    @Body() createPostDto: CreatePostDto,
    @UploadedFiles() images: Array<Express.Multer.File>,
    @Request() req: PostRequest,
  ) {
    const userId = req.user.sub;
    return this.postService.create(createPostDto, images, userId);
  }

  /**
   * Обновление поста
   */
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @UseInterceptors(
    FilesInterceptor('images', 5, {
      storage: diskStorage({
        destination: './uploads',
        filename: (_, file: any, callback: any) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          const filename = `${file.fieldname}-${uniqueSuffix}${ext}`;
          callback(null, filename);
        },
      }),
    }),
  )
  async update(
    @Param('id') id: string,
    @Body() updatePostDto: UpdatePostDto,
    @UploadedFiles() images: Array<Express.Multer.File>,
    @Request() req: PostRequest,
  ) {
    const userId = req.user.sub;
    return this.postService.update(id, updatePostDto, images, userId);
  }

  /**
   * Удаление поста
   */
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req: PostRequest) {
    const userId = req.user.sub;
    return this.postService.remove(id, userId);
  }
}
