# Backend Learning Notebook

এই নোটবুকটা তোমার বর্তমান প্রজেক্ট দেখে বানানো। লক্ষ্য হলো শুধু "কোন ফাইল কী করছে" জানা না, বরং পুরো backend flow বুঝে ফেলা।

## 1. এই প্রজেক্টটা কী?

এটা একটি `Express + TypeScript + Prisma + PostgreSQL + JWT` backend project।

এই project দিয়ে তুমি শিখতে পারবে:

- Express server কীভাবে start হয়
- Route -> Controller -> Service flow কীভাবে কাজ করে
- Prisma দিয়ে database query কীভাবে করা হয়
- JWT login system কীভাবে বানানো হয়
- Cookie-based authentication কীভাবে কাজ করে
- Middleware দিয়ে protected route কীভাবে তৈরি করা হয়

## 2. Project Stack

- Runtime: `Node.js`
- Language: `TypeScript`
- Server Framework: `Express`
- ORM: `Prisma`
- Database: `PostgreSQL`
- Auth: `JWT + Cookies`
- Password Hashing: `bcrypt`

## 3. Folder Map

সবচেয়ে আগে এই folder গুলো চিনে নাও:

- `src/server.ts` -> server start করে
- `src/app.ts` -> express app setup করে
- `src/config/index.ts` -> `.env` config load করে
- `src/lib/prisma.ts` -> Prisma client setup
- `src/modules/auth` -> login + refresh token logic
- `src/modules/users` -> register + profile logic
- `src/middlewares/auth.ts` -> protected route middleware
- `src/utils` -> reusable helper
- `prisma/schema` -> database model definition
- `prisma/migrations` -> database migration history

## 4. আগে কোন ফাইলগুলো পড়বে?

এই order follow করলে সবচেয়ে কম confusion হবে:

1. `src/server.ts`
2. `src/app.ts`
3. `src/modules/users/users.router.ts`
4. `src/modules/users/users.controller.ts`
5. `src/modules/users/users.service.ts`
6. `src/modules/auth/auth.route.ts`
7. `src/modules/auth/auth.controller.ts`
8. `src/modules/auth/auth.service.ts`
9. `src/middlewares/auth.ts`
10. `src/lib/prisma.ts`
11. `prisma/schema/user.prisma`
12. `prisma/schema/profile.prisma`
13. `prisma/schema/enums.prisma`

## 5. Startup Flow

Project start হওয়ার সময় flow:

```text
src/server.ts
  -> prisma database connect
  -> app.listen(PORT)
  -> src/app.ts express app setup
  -> route mount
```

### `src/server.ts`

এখানে দুইটা গুরুত্বপূর্ণ কাজ হচ্ছে:

- database connect করা
- server listen করা

এখান থেকে বুঝতে হবে:

- backend app start হওয়ার আগে database ready থাকা কেন দরকার
- `try/catch` দিয়ে startup error handle করা কেন দরকার

### `src/app.ts`

এই ফাইলে express app configure করা হয়েছে:

- `express.json()` -> JSON body parse করে
- `express.urlencoded()` -> form data parse করে
- `cookieParser()` -> cookie read করে
- `cors()` -> frontend থেকে request allow করে
- route mount করে:
  - `/api/user`
  - `/api/auth`

এখান থেকে শেখার বিষয়:

- middleware আগে run হয়
- route পরে run হয়
- app setup আর business logic আলাদা রাখা ভালো practice

## 6. Main Architecture

এই project-এ basic architecture হলো:

```text
Route -> Controller -> Service -> Prisma/Database -> Response
```

### Route

Route শুধু endpoint define করে।

উদাহরণ:

- `POST /api/user/register`
- `GET /api/user/me`
- `PUT /api/user/my-profile`
- `POST /api/auth/login`
- `POST /api/auth/refresh-token`

### Controller

Controller request নেয়, service call করে, response পাঠায়।

Controller-এর কাজ:

- `req.body`, `req.cookies`, `req.user` থেকে data নেওয়া
- service call করা
- final response পাঠানো

### Service

Service-এ মূল business logic থাকে।

Service-এর কাজ:

- database query করা
- password hash/check করা
- token generate করা
- transaction চালানো

## 7. User Module শেখা

### Register Flow

Route:

- `src/modules/users/users.router.ts`

Controller:

- `src/modules/users/users.controller.ts`

Service:

- `src/modules/users/users.service.ts`

Register request flow:

```text
POST /api/user/register
  -> users.router.ts
  -> userController.registerUser
  -> userServices.registerUserIntoDB
  -> user + profile create
  -> sendResponse
```

### `registerUserIntoDB()` function কী করছে?

এই function step by step:

1. `name`, `email`, `password`, `profilePhoto` নেয়
2. email already আছে কিনা check করে
3. password hash করে
4. transaction দিয়ে `user` create করে
5. transaction দিয়েই `profile` create করে
6. শেষে password বাদ দিয়ে user return করে

এখান থেকে শেখার বিষয়:

- কেন password plain text রাখা যাবে না
- `bcrypt.hash()` কেন দরকার
- transaction কেন দরকার
- user create হওয়ার সাথে সাথে profile create করার benefit কী

### Profile Get Flow

```text
GET /api/user/me
  -> auth middleware
  -> token verify
  -> req.user set
  -> controller
  -> service
  -> profile response
```

এখানে তুমি protected route বুঝবে।

### Profile Update Flow

```text
PUT /api/user/my-profile
  -> auth middleware
  -> req.user.id
  -> update user + profile
  -> success response
```

এখানে nested update শিখতে পারবে:

- `user` update
- related `profile` update

## 8. Auth Module শেখা

### Login Flow

Route:

- `src/modules/auth/auth.route.ts`

Controller:

- `src/modules/auth/auth.controller.ts`

Service:

- `src/modules/auth/auth.service.ts`

Login flow:

```text
POST /api/auth/login
  -> controller body নেয়
  -> service user খোঁজে
  -> bcrypt.compare() দিয়ে password check
  -> accessToken create
  -> refreshToken create
  -> cookie set
  -> response send
```

### Login-এর important concept

- `findUniqueOrThrow()` -> user না পেলে error দিবে
- `bcrypt.compare()` -> password match check করে
- `jwtUtils.createToken()` -> token বানায়
- `res.cookie()` -> token browser cookie-তে রাখে

### Refresh Token Flow

```text
POST /api/auth/refresh-token
  -> cookie থেকে refreshToken নেয়
  -> verify করে
  -> user check করে
  -> নতুন accessToken বানায়
  -> cookie update করে
```

এখানে access token আর refresh token-এর পার্থক্য বুঝো:

- access token short-lived
- refresh token long-lived
- refresh token দিয়ে নতুন access token বানানো হয়

## 9. Auth Middleware কীভাবে কাজ করছে

ফাইল:

- `src/middlewares/auth.ts`

এই middleware-এর কাজ:

1. token cookie বা header থেকে নেয়
2. token verify করে
3. role check করে
4. database-এ user এখনো আছে কিনা দেখে
5. user blocked কিনা check করে
6. `req.user`-এ data বসায়
7. `next()` call করে

এখান থেকে ৩টা বড় জিনিস শিখবে:

- middleware controller-এর আগে run হয়
- JWT verify করার পর user info request-এ attach করা যায়
- role-based authorization কীভাবে করা হয়

## 10. Prisma Part বুঝে নাও

### Prisma setup

ফাইল:

- `src/lib/prisma.ts`
- `prisma/schema/schema.prisma`

এখানে Prisma Postgres adapter use করা হয়েছে।

### User model

ফাইল:

- `prisma/schema/user.prisma`

এখানে fields:

- `id`
- `name`
- `email`
- `password`
- `activeStatus`
- `role`
- `createdAt`
- `updatedAt`
- `profile`

### Profile model

ফাইল:

- `prisma/schema/profile.prisma`

এখানে relation:

- একটি `User` এর একটি `profile`
- `userId` unique

এটা basically one-to-one relation।

### Enums

ফাইল:

- `prisma/schema/enums.prisma`

দুইটা enum আছে:

- `ActiveStatus`
- `Role`

এখান থেকে শিখবে:

- enum কেন দরকার
- role system hardcoded string-এর থেকে enum-এ safer কেন

## 11. Utility Files

### `src/utils/jwt.ts`

এই file-এ দুইটা কাজ:

- token create
- token verify

শেখার বিষয়:

- helper function লিখে repeated logic কমানো যায়
- auth logic reusable করা যায়

### `src/utils/catchAsync.ts`

এই file controller-এর try/catch simplify করতে use হয়েছে।

Idea:

- প্রতিটা async controller-এ আলাদা `try/catch` না লিখে wrapper use করা

### `src/utils/sendResponse.ts`

এই file response format same রাখতে use হয়েছে।

Benefit:

- সব endpoint-এর response structure consistent হয়

## 12. Request থেকে Response পর্যন্ত Full Picture

যদি frontend থেকে request যায়:

```text
Frontend
  -> Express Route
  -> Controller
  -> Service
  -> Prisma
  -> PostgreSQL
  -> Service
  -> Controller
  -> sendResponse()
  -> Frontend
```

এই flow পুরোটা মাথায় বসলে backend অনেক সহজ লাগবে।

## 13. এই প্রজেক্ট থেকে কোন concept গুলো শিখে ফেলবে

- Express app setup
- modular folder structure
- route/controller/service pattern
- middleware
- authentication
- authorization
- JWT
- cookies
- Prisma relation
- transaction
- password hashing
- centralized response format

## 14. নিজে হাতে Practice করো

এই project দেখে দেখে নিচের কাজগুলো নিজে করার চেষ্টা করো:

1. `GET /api/user/all-users` endpoint বানাও
2. `DELETE /api/user/:id` endpoint বানাও
3. blocked user login বন্ধ করো
4. register-এর সময় bio নেওয়ার support যোগ করো
5. `change-password` endpoint বানাও
6. logout route বানাও
7. global error handler যোগ করো
8. validation layer যোগ করো

## 15. পড়ার সময় নিজেকে এই প্রশ্নগুলো করো

প্রতিটা file পড়ার সময় নিজেকে জিজ্ঞেস করো:

1. এই file-এর single responsibility কী?
2. এখানে data কোথা থেকে আসছে?
3. এখানে data কোথায় যাচ্ছে?
4. এখানে database query আছে নাকি শুধু flow control?
5. এখানে security-related logic আছে কি?
6. error হলে কী হবে?

## 16. এই project-এ improvement করার জায়গা

শেখার জন্য এগুলো important:

- `catchAsync` এখন সব error-এ একই generic `500` response দিচ্ছে
- error message `Failed to Register user` সব route-এর জন্য ঠিক না
- refresh token cookie-এর `maxAge` calculation আর comment মিলিয়ে আবার check করা দরকার
- migration table name আর current Prisma model mapping একবার মিলিয়ে দেখা ভালো
- request validation layer এখনো নেই
- centralized global error handler নেই

এই জিনিসগুলো fix করতে পারলে project অনেক বেশি production-ready হবে।

## 17. Suggested Study Plan

### Day 1

- `server.ts` + `app.ts` বুঝো
- route/controller/service difference বুঝো

### Day 2

- register flow line by line follow করো
- Prisma model আর transaction বুঝো

### Day 3

- login + refresh token flow follow করো
- middleware কীভাবে request protect করছে বুঝো

### Day 4

- নিজে নতুন endpoint বানাও
- error handling improve করার চেষ্টা করো

## 18. Quick Revision

এক লাইনে পুরো project:

`Express app request নেয়, controller service-কে call করে, service Prisma দিয়ে database handle করে, auth middleware JWT check করে, তারপর structured response frontend-এ পাঠানো হয়।`

## 19. Last Advice

এই project শেখার best way হলো:

1. file পড়ো
2. flow কাগজে আঁকো
3. Postman দিয়ে request মারো
4. console log দিয়ে flow দেখো
5. তারপর নিজে feature add করো

শুধু code দেখে গেলে অর্ধেক শিখবে।
কিন্তু code দেখে + flow লিখে + নিজে modify করলে অনেক দ্রুত শিখবে।
