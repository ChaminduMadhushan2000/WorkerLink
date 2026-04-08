import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Redis from 'ioredis';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { ServiceResult } from '../../common/interfaces/api-response.interface';
import { REDIS_CLIENT } from '../../common/redis/redis.constants';

const CACHE_KEY = 'master-data:categories';
const CACHE_TTL = 3600; // 1 hour in seconds

@Injectable()
export class MasterDataService {
  private readonly logger = new Logger(MasterDataService.name);

  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @Inject(REDIS_CLIENT)
    private readonly redis: Redis,
  ) {}

  // ─── PUBLIC METHODS ───────────────────────────────────────────────

  async getAllCategories(): Promise<ServiceResult<Category[]>> {
    try {
      const cached = await this._getCachedCategories();
      if (cached.data) {
        return {
          success: true,
          message: 'Categories fetched',
          data: cached.data,
        };
      }

      const categories = await this.categoryRepository.find({
        where: { isActive: true },
        order: { name: 'ASC' },
      });

      await this._cacheCategories(categories);

      return { success: true, message: 'Categories fetched', data: categories };
    } catch (error) {
      this.logger.error(
        'getAllCategories failed',
        error instanceof Error ? error.stack : error,
      );
      throw error;
    }
  }

  async createCategory(
    dto: CreateCategoryDto,
  ): Promise<ServiceResult<Category>> {
    try {
      const existing = await this._findBySlug(dto.slug);
      if (existing.data) {
        throw new ConflictException('Category with this slug already exists');
      }

      const category = this.categoryRepository.create(dto);
      const saved = await this.categoryRepository.save(category);

      await this._invalidateCache();

      this.logger.log(
        JSON.stringify({ action: 'CATEGORY_CREATED', categoryId: saved.id }),
      );

      return { success: true, message: 'Category created', data: saved };
    } catch (error) {
      if (error instanceof ConflictException) throw error;
      this.logger.error(
        'createCategory failed',
        error instanceof Error ? error.stack : error,
      );
      throw error;
    }
  }

  async updateCategory(
    id: string,
    dto: UpdateCategoryDto,
  ): Promise<ServiceResult<Category>> {
    try {
      const categoryResult = await this._findById(id);
      if (!categoryResult.data) {
        throw new NotFoundException('Category not found');
      }

      const updated = await this.categoryRepository.save({
        ...categoryResult.data,
        ...dto,
      });

      await this._invalidateCache();

      this.logger.log(
        JSON.stringify({ action: 'CATEGORY_UPDATED', categoryId: id }),
      );

      return { success: true, message: 'Category updated', data: updated };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(
        'updateCategory failed',
        error instanceof Error ? error.stack : error,
      );
      throw error;
    }
  }

  async deleteCategory(id: string): Promise<ServiceResult<null>> {
    try {
      const categoryResult = await this._findById(id);
      if (!categoryResult.data) {
        throw new NotFoundException('Category not found');
      }

      await this.categoryRepository.softDelete(id);
      await this._invalidateCache();

      this.logger.log(
        JSON.stringify({ action: 'CATEGORY_DELETED', categoryId: id }),
      );

      return { success: true, message: 'Category deleted', data: null };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(
        'deleteCategory failed',
        error instanceof Error ? error.stack : error,
      );
      throw error;
    }
  }

  // ─── PRIVATE HELPERS ──────────────────────────────────────────────

  private async _getCachedCategories(): Promise<
    ServiceResult<Category[] | null>
  > {
    try {
      const cached = await this.redis.get(CACHE_KEY);
      if (cached) {
        return {
          success: true,
          message: 'Cache hit',
          data: JSON.parse(cached) as Category[],
        };
      }
      return { success: true, message: 'Cache miss', data: null };
    } catch (error) {
      this.logger.warn('_getCachedCategories failed', error);
      return { success: false, message: 'Cache error', data: null };
    }
  }

  private async _cacheCategories(
    categories: Category[],
  ): Promise<ServiceResult<null>> {
    try {
      await this.redis.setex(CACHE_KEY, CACHE_TTL, JSON.stringify(categories));
      return { success: true, message: 'Cached', data: null };
    } catch (error) {
      this.logger.warn('_cacheCategories failed', error);
      return { success: false, message: 'Cache write failed', data: null };
    }
  }

  private async _invalidateCache(): Promise<ServiceResult<null>> {
    try {
      await this.redis.del(CACHE_KEY);
      return { success: true, message: 'Cache invalidated', data: null };
    } catch (error) {
      this.logger.warn('_invalidateCache failed', error);
      return {
        success: false,
        message: 'Cache invalidation failed',
        data: null,
      };
    }
  }

  private async _findBySlug(slug: string): Promise<ServiceResult<Category>> {
    try {
      const category = await this.categoryRepository.findOne({
        where: { slug },
      });
      return {
        success: true,
        message: 'Query complete',
        data: category ?? null,
      };
    } catch (error) {
      this.logger.warn('_findBySlug failed', error);
      return { success: false, message: 'Query failed', data: null };
    }
  }

  private async _findById(id: string): Promise<ServiceResult<Category>> {
    try {
      const category = await this.categoryRepository.findOne({ where: { id } });
      return {
        success: true,
        message: 'Query complete',
        data: category ?? null,
      };
    } catch (error) {
      this.logger.warn('_findById failed', error);
      return { success: false, message: 'Query failed', data: null };
    }
  }
}
