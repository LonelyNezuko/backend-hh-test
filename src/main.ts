import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { UserEntity } from './user/user.entity';

declare global {
    namespace Express {
        interface Request {
            user: UserEntity
        }
    }
}

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.useGlobalPipes(new ValidationPipe());

    await app.listen(process.env.PORT);

    console.log(`[main] App start on the ${process.env.PORT}. EnvFile: ${process.env.NODE_ENV}`)
}
bootstrap();
