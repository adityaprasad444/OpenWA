// ────────────────────────────────────────────────────────────────────────────────
// Vercel Serverless Handler — OpenWA API Gateway
// ────────────────────────────────────────────────────────────────────────────────
import './env-setup';

import type { Request, Response } from 'express';
import express, { Express } from 'express';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/configure-app';
import '../src/config/load-env';

import { applyGlobalValidation } from '../src/config/app-validation';
import { SwaggerModule } from '@nestjs/swagger';
import { createSwaggerConfig, dropUnexpressibleOperations, exemptPublicOperations } from '../src/config/swagger.config';

let expressServer: Express | undefined;
let isAppInitialized = false;
let initError: Error | null = null;

async function initServerlessApp(): Promise<void> {
  if (isAppInitialized) return;
  if (initError) throw initError;
  try {
    expressServer = express();
    const app = await NestFactory.create(AppModule, new ExpressAdapter(expressServer), {
      logger: ['error', 'warn', 'log'],
    });
    configureApp(app);
    applyGlobalValidation(app);

    const config = createSwaggerConfig();
    const document = SwaggerModule.createDocument(app, config);
    dropUnexpressibleOperations(document);
    exemptPublicOperations(document);
    SwaggerModule.setup('api/docs', app, document);

    await app.init();
    isAppInitialized = true;
  } catch (err: unknown) {
    initError = err instanceof Error ? err : new Error(String(err));
    console.error('[Vercel Serverless Init Error]:', initError);
    throw initError;
  }
}

export default async function handler(req: Request, res: Response): Promise<void> {
  if (!isAppInitialized) {
    try {
      await initServerlessApp();
    } catch (err: unknown) {
      const errorObj = err instanceof Error ? err : new Error(String(err));
      res.status(500).json({
        statusCode: 500,
        error: 'Internal Server Error',
        message: 'Serverless application initialization failed',
        details: errorObj.message,
      });
      return;
    }
  }

  expressServer!(req, res);
}
