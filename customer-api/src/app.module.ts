import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CustomerModule } from './modules/customer/customer.module';
import { CustomerController } from './controllers/customer/customer.controller';
import { AuthenticationController } from '@controllers/authentication/login.controller';
import { JwtModule } from '@nestjs/jwt';
import { JwtAuthGuard } from './guards/jwtAuthGuard';
import { RolesGuard } from './guards/rolesGuard';
import { ConfigModule } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { JWT_SIGNING_KEY } from './config/secrets';

@Module({
  imports: [
    JwtModule.register({
      secret: JWT_SIGNING_KEY,
      signOptions: { expiresIn: '1h' },  // Token expiration time
    }),
    CustomerModule,
    ConfigModule.forRoot ()],
  controllers: [AppController, CustomerController, AuthenticationController],
  providers: [AppService, JwtAuthGuard, RolesGuard, Reflector],
  exports: [JwtModule],  // Export JwtModule if needed elsewhere
})
export class AppModule {}