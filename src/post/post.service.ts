import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './post.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { User } from '../user/user.entity';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
  ) {}

  /**
   * Получение списка постов с пагинацией и сортировкой
   */
  async findAll(
    limit: number,
    offset: number,
    sortBy: string,
  ): Promise<Post[]> {
    return this.postRepository.find({
      take: limit,
      skip: offset,
      order: { [sortBy]: 'DESC' },
    });
  }

  /**
   * Получение одного поста по ID
   */
  async findOne(id: string): Promise<Post> {
    const post = await this.postRepository.findOne({ where: { id } });
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    return post;
  }

  /**
   * Создание нового поста
   */
  async create(
    createPostDto: CreatePostDto,
    images: Express.Multer.File[],
    userId: string,
  ): Promise<Post> {
    const user = new User();
    user.id = userId;

    const post = new Post();
    post.title = createPostDto.title;
    post.content = createPostDto.content;
    post.images = images.map((image) => image.filename);
    post.author = user;

    return this.postRepository.save(post);
  }

  /**
   * Обновление поста
   */
  async update(
    id: string,
    updatePostDto: UpdatePostDto,
    images: Express.Multer.File[],
    userId: string,
  ): Promise<Post> {
    const post = await this.postRepository.findOne({
      where: { id, author: { id: userId } },
    });
    if (!post) {
      throw new NotFoundException(
        'Post not found or you do not have permission to update it',
      );
    }

    if (updatePostDto.title) post.title = updatePostDto.title;
    if (updatePostDto.content) post.content = updatePostDto.content;

    if (images.length > 0) {
      // Удаляем старые изображения
      post.images.forEach((image) => {
        const filePath = path.join(__dirname, '../../uploads', image);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });

      // Сохраняем новые изображения
      post.images = images.map((image) => image.filename);
    }

    return this.postRepository.save(post);
  }

  /**
   * Удаление поста
   */
  async remove(id: string, userId: string): Promise<void> {
    const post = await this.postRepository.findOne({
      where: { id, author: { id: userId } },
    });
    if (!post) {
      throw new NotFoundException(
        'Post not found or you do not have permission to delete it',
      );
    }

    // Удаляем связанные изображения
    post.images.forEach((image) => {
      const filePath = path.join(__dirname, '../../uploads', image);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    });

    await this.postRepository.remove(post);
  }
}
