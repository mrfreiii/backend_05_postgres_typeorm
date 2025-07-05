import { config } from "dotenv";
import request from "supertest";
import TestAgent from "supertest/lib/agent";
import { Test, TestingModuleBuilder } from "@nestjs/testing";
import { MailerService } from "@nestjs-modules/mailer";
import { NestExpressApplication } from "@nestjs/platform-express";

import { SETTINGS } from "../settings";
import { appSetup } from "../setup/app.setup";
import { initAppModule } from "../init-app-module";
import { EmailServiceMock } from "./mock/email-service.mock";
import { EmailService } from "../modules/notifications/application/email.service";
import { RateLimitMock } from "./mock/rate-limit.mock";
import { RateLimitGuard } from "../modules/rateLimit/guards/rate-limit.guard";

config();

export let req: InstanceType<typeof TestAgent>;

const userCredentials = `${process.env?.BASIC_AUTH_LOGIN}:${process.env?.BASIC_AUTH_PASSWORD}`;
const encodedUserCredentials = Buffer.from(userCredentials, "utf8").toString(
  "base64",
);
export const testBasicAuthHeader = `Basic ${encodedUserCredentials}`;

export const emailServiceMock = new EmailServiceMock({} as MailerService);

export const connectToTestDBAndClearRepositories = (
  mockRateLimit?: boolean,
) => {
  let app: NestExpressApplication;

  beforeAll(async () => {
    const DynamicAppModule = await initAppModule();

    const moduleBuilder: TestingModuleBuilder = Test.createTestingModule({
      imports: [DynamicAppModule],
    })
      .overrideProvider(EmailService)
      .useClass(EmailServiceMock);

    if (mockRateLimit) {
      moduleBuilder.overrideGuard(RateLimitGuard).useValue(RateLimitMock);
    }

    const moduleFixture = await moduleBuilder.compile();

    app = moduleFixture.createNestApplication({ logger: false });
    // const coreConfig = app.get<CoreConfig>(CoreConfig);
    appSetup({ app, env: "e2e_tests" });

    await app.init();

    req = request(app.getHttpServer());

    await req.delete(`${SETTINGS.PATH.TESTING}/all-data`).expect(204);

    emailServiceMock.sendEmailWithConfirmationCode = jest
      .fn()
      .mockImplementation(() => Promise.resolve());

    emailServiceMock.sendEmailWithPasswordRecoveryCode = jest
      .fn()
      .mockImplementation(() => Promise.resolve());
  });

  afterAll(async () => {
    await app.close();
  });
};

export const RealDate = Date;
export const mockDate = (isoDate: string) => {
  class MockDate extends RealDate {
    constructor() {
      super();
      return new RealDate(isoDate);
    }

    static now() {
      return new RealDate(isoDate).getTime();
    }
  }

  // @ts-expect-error: some error
  global.Date = MockDate;
};

export const delayInSec = (delay: number) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({});
    }, delay * 1000);
  });
};
