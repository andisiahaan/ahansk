import {
  PipeTransform,
  Injectable,
  UnprocessableEntityException,
  ArgumentMetadata,
  Optional,
} from '@nestjs/common';
import { messages } from '@ahansk/shared';

// Minimal structural type compatible with any Zod v4 schema.
// Zod v4 uses PropertyKey[] (string | number | symbol) for issue paths.
interface ZodLike {
  safeParse(value: unknown): {
    success: boolean;
    data?: unknown;
    error?: { issues: Array<{ path: PropertyKey[]; message: string }> };
  };
}

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(@Optional() private readonly schema?: ZodLike) {}

  transform(value: unknown, metadata: ArgumentMetadata): unknown {
    const schemaToUse =
      this.schema ||
      (metadata.metatype as (new () => unknown) & { zodSchema?: ZodLike })
        ?.zodSchema;

    if (!schemaToUse) {
      return value;
    }

    const result = schemaToUse.safeParse(value);
    if (!result.success) {
      const formattedErrors = (result.error?.issues ?? []).reduce(
        (
          acc: Record<string, string[]>,
          issue: { path: PropertyKey[]; message: string },
        ) => {
          const field = issue.path.map(String).join('.') || '_root';
          if (!acc[field]) acc[field] = [];
          acc[field].push(issue.message);
          return acc;
        },
        {},
      );
      throw new UnprocessableEntityException({
        message: messages.common.validationError,
        error: formattedErrors,
      });
    }
    return result.data;
  }
}
