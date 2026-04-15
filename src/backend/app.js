const express = require('express');
const { nanoid } = require('nanoid');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
const port = 3000;

const ACCESS_SECRET = "access_secret";
const REFRESH_SECRET = "refresh_secret";
const ACCESS_EXPIRES_IN = '15m';
const REFRESH_EXPIRES_IN = '7d'

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'API Product Store',
            version: '1.0.0',
            description: 'API магазина с продуктами',
        },
        servers: [
            {
                url: `http://localhost:${port}`,
                description: "Локальный сервер",
            },
        ],
    },
    apis: ['./app.js'],
};

let users = [ ];
let products = [ {id: "pon21", title: "Banana", category: "Fruit", description: "Yellow banana", price: 123 } ];
let refresh_tokens = new Set();

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use(express.json())
app.use(express.urlencoded({ extended: false }));

app.use(cors({
    origin: 'http://localhost:3001',
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

function authMiddleware(req, res, next) {
    const header = req.headers.authorization || "";
    const [scheme, access_token] = header.split(" ");

    console.log(scheme);
    console.log(access_token);

    if(scheme !== "Bearer" || !access_token){
        return res.status(401).json({ error: "Не найден или неправильный заголовок авторизации" });
    }

    try{
        const payload = jwt.verify(access_token, ACCESS_SECRET);

        req.user = payload;
        next();
    }catch(err){
        return res.status(401).json({ error: "Неправильный или истёкший токен авторизации"});
    }
}

function roleMiddleware(allowedRoles) {
    return (req, res, next) => {
        if(!req.user || !allowedRoles.includes(req.user.role)){
            console.log(`[RMW]: ERROR WITH USER: ${req.user.role}`);
            return res.status(403).json({ error: "Forbidden" });
        }
        next();
    };
}

function findUserOr404(id){
    const user = users.find(u => u.id == id);
    if(user === undefined){
        return null;
    }
    return user;
}

function findUserByEmailOr404(email){
    const user = users.find(u => u.email == email);
    if(user === undefined){
        return null;
    }
    return user;
}

async function hashPassword(password){
    const rounds = 10;
    return bcrypt.hash(password, 10);
}

async function verifyPassword(password, hashPassword){
    return bcrypt.compare(password, hashPassword);
}

async function CreateTestUser(){
    const hashedPassword = await hashPassword("lololol")
    users.push({ 
        id: "nuk12",
        email: "pronin6030@mail.ru",
        first_name: "Vladislav",
        last_name: "Pronin",
        role: 'admin',
        hashedPassword: hashedPassword
    });
}

function generateaccess_token(user){
    const access_token = jwt.sign(
        {
            sub: user.id,
            email: user.email,
            role: user.role
        },
        ACCESS_SECRET,
        {
            expiresIn: ACCESS_EXPIRES_IN,
        }
    );
    return access_token;
}

function generaterefresh_token(user){
    const refresh_token = jwt.sign(
        {
            sub: user.id,
            email: user.email,
            role: user.role
        },
        REFRESH_SECRET,
        {
            expiresIn: REFRESH_EXPIRES_IN,
        }
    );
    return refresh_token;
}

app.use((req, res, next) => {
    res.on('finish', () => {
        console.log(`[${new Date().toISOString()}] [${req.method}] ${res.statusCode} ${req.path}`);
        if(req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH'){
            console.log('Body:', req.body)
        }
    });
    next();
});

app.get('/api/auth/me', authMiddleware, (req, res) => {
    const userId = req.user.sub;
    const user = findUserOr404(userId);
    if(!user){
        return res.status(404).json({ error: "Пользователь не найден!"});
    }

    res.json({
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
    });
});

/**
 * @swagger
 * /api/auth/register:
 *  post:
 *      summary: Регистрация пользователя
 *      description: Создаёт нового пользователя с хешированным паролем
 *      tags: [Auth]
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      required:
 *                          - email
 *                          - first_name
 *                          - last_name
 *                          - password
 *                      properties:
 *                          email:
 *                              type: string
 *                              example: pronin_vladislav@yandex.ru
 *                          first_name:
 *                              type: string
 *                              example: Vladislav
 *                          last_name:
 *                              type: string
 *                              example: Pronin
 *                          password:
 *                              type: string
 *                              example: 42password52
 *      responses:
 *          201:
 *              description: Пользователь успешно создан
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              id: 
 *                                  type: string
 *                                  example: ab12cd
 *                              email:
 *                                  type: string
 *                                  example: pronin_vladislav@yandex.ru
 *                              first_name:
 *                                  type: string
 *                                  example: Vladislav
 *                              last_name:
 *                                  type: string
 *                                  example: Pronin
 *                              hashedPassword:
 *                                  type: string
 *                                  example: $2b$10$ig6GAMu0Jq45YIhjJl04b.SopPEq88e9id5P2fypqtD1TLlX33Q9u
 *          400:
 *              description: Некорректные данные
 */

app.post('/api/auth/register', async (req, res) => {
    const { email, first_name, last_name, role, password } = req.body;
    if(!email || !password || !first_name || !last_name){
        return res.status(400).json({error:"Почта, пароль, имя и фамилия обязательны для ввода!"});
    }
    if(users.some(u => u.email === email)){
        return res.status(409).json({ error: "Пользователь с такой почтой уже существует!" });
    }

    newUser = {
        id: nanoid(5),
        email: email,
        first_name: first_name,
        last_name: last_name,
        role: role || "user",
        isBanned: false,
        hashedPassword: await hashPassword(password)
    };

    users.push(newUser);

    let access_token = generateaccess_token(newUser);
    let refresh_token = generaterefresh_token(newUser);

    res.status(201).json({user: newUser, access_token: access_token, refresh_token: refresh_token});
});

/**
 * @swagger
 * /api/auth/login:
 *  post:
 *      summary: Авторизация пользователя
 *      description: Проверяет почту и пароль пользователя
 *      tags: [Auth]
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      required:
 *                        - email
 *                        - first_name
 *                        - last_name
 *                        - password
 *                      properties:
 *                          email:
 *                              type: string
 *                              example: pronin_vladislav@yandex.ru
 *                          first_name:
 *                              type: string
 *                              example: Vladislav
 *                          last_name:
 *                              type: string
 *                              example: Pronin
 *                          password:
 *                              type: string
 *                              example: 42password52
 *      responses:
 *          200:
 *              description: Пользователь успешно авторизован
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              login:
 *                                  login: boolean
 *                                  example: true
 *          400:
 *              description: Отсутствуют обязательные поля
 *          401:
 *              description: Неверные учетные данные
 *          404:
 *              description: Пользователь не найден
 */

app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;

    if(!email || !password){
        return res.status(400).json({ error: "Укажите почту и пароль!" });
    }

    const user = findUserByEmailOr404(email);
    if(!user){
        return res.status(404).json({ error: "Пользователь не найден!" });
    }
    
    const isAuth = await verifyPassword(password, user.hashedPassword);
    if(isAuth){
        const access_token = generateaccess_token(user);
        const refresh_token = generaterefresh_token(user);
        refresh_tokens.add(refresh_token);
        res.status(200).json({ access_token, refresh_token });
    }else{
        res.status(401).json({ error: "Не удалось авторизоваться." });
    }
});

app.post('/api/auth/refresh', (req, res) => {
    const { refresh_token } = req.body;
    
    if(!refresh_token){
        return res.status(400).json({ error: "Требуется refresh-токен!" });
    }

    if(!refresh_tokens.has(refresh_token)){
        return res.status(404).json({ error: "Неправильный refresh-токен!" });
    }

    try{
        const payload = jwt.verify(refresh_token, REFRESH_SECRET);

        const user = findUserOr404(payload.sub);
        if(!user){
            return res.status(404).json({ error: "Пользователь не найден!" });
        }

        refresh_tokens.delete(refresh_token);

        const newaccess_token = generateaccess_token(user);
        const newrefresh_token = generaterefresh_token(user);

        refresh_tokens.add(newrefresh_token);

        res.json({ access_token: newaccess_token, refresh_token: newrefresh_token });
    } catch(err){
        return res.status(401).json({ error: "Неправильный или истёкший refresh-токен!" });
    }
});
//getusers getuser updateuser(put) banuser
app.get('/api/users', authMiddleware, roleMiddleware(["admin"]), (req, res) => {
    return res.status(200).json(users);
});
app.get('/api/users/:id', authMiddleware, roleMiddleware(["admin"]), (req, res) => {
    const id = req.params.id;
    let user = users.find(u => u.id === id);
    if(!user){
        return res.status(404).json({error: "Пользователь не найден!"});
    }

    return res.status(200).json(user);
});
app.put('/api/users/:id', authMiddleware, roleMiddleware(["admin"]), async (req, res) => {
    const id = req.params.id;
    const { email, first_name, last_name } = req.body;
    if(!email || !first_name || !last_name){
        return res.status(400).json({error: "Что-то из (почта, имя, фамилия) не указано!"});
    }

    let user = users.find(u => u.id === id);
    user.email = email;
    user.first_name = first_name;
    user.last_name = last_name;

    return res.status(201).json(user);
});
app.delete('/api/users/:id', authMiddleware, roleMiddleware(["admin"]), async (req, res) => {
    const id = req.params.id;
    let user = users.find(u => u.id === id);

    if(!user){
        return res.status(404).json({error:"Пользователь не найден!"});
    }

    user.isBanned = !user.isBanned;

    res.status(201).json(user);
    console.log(user.email + " " + user.role);
});

//swagy ne zabit
app.post('/api/products', authMiddleware, roleMiddleware(["admin", "seller"]), async (req, res) => {
    const { title, category, description, price } = req.body;
    if(!title || !category || !description || price === undefined){
        return res.status(400).json({ error: "Что то из (название, категория, описание, стоимость) не указано!" });
    }

    newProduct = {
        id: nanoid(5),
        title: title,
        category: category,
        description: description,
        price: price
    };

    products.push(newProduct);
    res.status(201).json(newProduct);
});

app.get('/api/products', authMiddleware, roleMiddleware(["admin", "seller", "user"]), async (req, res) => {
    res.status(200).json(products);
});

app.get('/api/products/:id', authMiddleware, roleMiddleware(["admin", "seller", "user"]), async (req, res) => {
    const id = req.params.id;
    product = products.find(p => p.id === id);

    if(!product){
        return res.status(400).json({ error: "Что-то пошло не так..." });
    }

    res.status(200).json(product);
});

app.put('/api/products/:id', authMiddleware, roleMiddleware(["admin", "seller"]), async (req, res) => {
    const id = req.params.id;
    const { title, category, description, price } = req.body;
    if(!title || !category || !description || price === undefined){
        return res.status(400).json({ error: "Что то из (название, категория, описание, стоимость) не указано!" });
    }

    const product = products.find(p => p.id === id);

    product.title = title;
    product.category = category;
    product.description = description;
    product.price = price

    res.status(201).json(product);
});

app.delete('/api/products/:id', authMiddleware, roleMiddleware(["admin", "seller"]), async (req, res) => {
    const id = req.params.id;
    product = products.find(p => p.id == id);
    if(product == undefined){
        return res.status(404).json({"message": "Продукт не найден!"})
    }
    products = products.filter(p => p.id != id);

    return res.status(200).json({"message": "Продукт успешно удалён!"});
});

app.use(express.static('public'));

app.listen(port, async () => {
    await CreateTestUser();
    console.log(`Сервер запущен на http://localhost:${port}`);
    console.log(`Swagger UI запущен на http://localhost:${port}/api-docs`);
});