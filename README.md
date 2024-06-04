# Backend HH Test

Бэк написан с помощью: NestJS, TypeORM (MySQL)
Используемые пакеты: bcryptjs, class-transformer, class-validator, cross-env, jsonwebtoken, multer, sharp


Первоночальная настройка:

1. В терминале: npm i
1. В .production.env изменить 'db_mysql_database' (и/или другие данные от базы данных, которые необходимы)
2. В .production.env изменить 'jwt_privatekey' и 'jwt_accessprivatekey'
3. Создать базу данных с написанном ранее 'db_mysql_database' названием
4. В терминале: npm run migration:generate migrations/your_migration_name
5. В терминале: npm run migration:run. В случае ошибки и/или не инициализации таблиц проверить, правильно ли создался файл миграции (он необходим в папке migrations)



Запуск:
- development mode: npm run start:dev (необходим файл .development.env аналогичный .production.env)
- production mode: npm run start


Тестов нет =)


По поводу статика:
- Я использовал свои наработки. В src/__service есть storage. Вся его суть в storage.filemanager.ts и в storage.service.ts (getFile)


JWT:
- При авторизации выдается пара токенов авторизации JWT (refreshToken: string, accessToken: string). Для PUT /user/profile необходимо в headers указать authorization 'Bearer {accessToken}'. При ошибке 'Need to refresh token' указать повторно 'Refresh {refreshToken}' для обновления пары ключей JWT. Токены авторизации будут переданы обратно в headers в виде 'jwt-new-tokens-refresh' и 'jwt-new-tokens-access'. Срок действия refreshToken - 7d, accessToken - 10m


Дока:
- GET /user/profile/:id - получение пользователя по его ID
- GET /user/profiles - получение списка пользователей. Параметры: page: number (номер страницы), take: number (сколько пользователей показывать на странице)

- PUT /user/profile - изменения пользователя (необходимы токены авторизации JWT). Доступные параметры: name: string (length 4-32), email: string, gender: number (0/1)
- PUT /user/profile/photo - изменение фото пользователя (необходимы токены авторизации JWT). Доступные параметры: photo: File. (form-data)

- POST /user/register - регистрация пользователя. Доступные параметры: name: string (length 4-32), email: string, password: string (length 6-64)
- POST /user/login - аутентификация пользователя. Доступные параметры: name: string (length 4-32), password: string (length 6-64)



Варианты возврата:


{ // success
    statusCode: HttpStatusCode
    result: any
}
{ // error
    statusCode: HttpStatusCode
    error: string
    message: string
}
