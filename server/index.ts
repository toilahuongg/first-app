import Koa, { Context } from 'koa';
import Router from 'koa-router';
import * as dotenv from "dotenv";
import shopifyAuth, { verifyRequest } from '@shopify/koa-shopify-auth';
import Shopify, { ApiVersion } from '@shopify/shopify-api';

dotenv.config();
const PORT = 3000;

Shopify.Context.initialize({
  API_KEY: process.env.SHOPIFY_API_KEY as string,
  API_SECRET_KEY: process.env.SHOPIFY_API_SECRET as string,
  SCOPES: (process.env.SHOPIFY_APP_SCOPES as string).split(','),
  HOST_NAME: (process.env.SHOPIFY_APP_URL as string).replace(/^https:\/\//, ''),
  API_VERSION: ApiVersion.October20,
  IS_EMBEDDED_APP: true,
  SESSION_STORAGE: new Shopify.Session.MemorySessionStorage(),
});

const server = new Koa();
const router = new Router();
server.keys = [Shopify.Context.API_SECRET_KEY];
const ACTIVE_SHOPIFY_SHOPS: any = {};

server.use(
    shopifyAuth({
        async afterAuth(ctx) {
            const { shop, accessToken } = ctx.state.shopify;
            // Lu vao DB
            console.log(shop, accessToken);
            ctx.redirect('/home');
        },
    }),
);

router.get("/home", async (ctx) => {
  ctx.body = '🎉';
});

router.get("/", async (ctx) => {
  const shop = ctx.query.shop as string;

  if (ACTIVE_SHOPIFY_SHOPS[shop] === undefined) {
    ctx.redirect(`/auth?shop=${shop}`);
  } else {
    ctx.body = '🎉';
  }
});

server.use(verifyRequest());

server.use(router.allowedMethods());
server.use(router.routes());
server.listen(PORT, () => {
    console.log("> Connected");
})