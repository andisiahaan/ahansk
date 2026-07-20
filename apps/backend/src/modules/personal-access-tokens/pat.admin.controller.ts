import { Controller, Get, Delete, Param, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { PatService } from './pat.service';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('admin/personal-access-tokens')
@Roles('ADMIN')
export class PatAdminController {
  constructor(private readonly svc: PatService) {}

  @Get()
  list(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.svc.listAll(Number(page) || 1, Number(limit) || 20);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async revoke(@Param('id') id: string): Promise<void> {
    await this.svc.revoke(id, '', true);
  }
}
