import {Message, User, UserRepository} from "./entity/User";
import * as express from "express"
import { Request, Response } from "express"
import "reflect-metadata";
import {Connection, createConnection, getCustomRepository, getRepository} from "typeorm";
import * as bodyParser from "body-parser"
import * as cookieParser from "cookie-parser"
import {authorize, authenticate, unauthenticate} from "./auth"
import * as bcrypt from "bcrypt"
import * as rasaconfig from "../rasaconfig.json"
import axios from "axios"

interface Handler {
    method?: string;
    path: string;
    secure: boolean;
    role: string;
    action: (req: Request, res: Response, user?: User) => Promise<any>;
}

const AppRoutes: Handler[] = [
    {
        method: "get",
        path: "/",
        secure: true,
        role: "user",
        action: async (req: Request, res: Response) => {
            const userRepo = getCustomRepository(UserRepository)
            let user = await userRepo.findByEmail("hakim@rachidi.com");

            if (!user) {
                user = await userRepo.create({
                    firstName: "Hakim",
                    lastName: "Rachidi",
                    email: "hakim@rachidi.com",
                    sex: "m",
                    passwordHash: "",
                    birthDate: new Date(),
                    messages: []
                })
                await userRepo.save(user)
                user = await userRepo.findByEmail("hakim@rachidi.com");
            }

            res.json(user)
        }
    },
    {
        path: "/signup",
        secure: false,
        role: "user",
        action: async (req, res) => {
            const { user } = req.body
            const userRepo = getCustomRepository(UserRepository)

            let hash = await bcrypt.hash(user.password, 10)
            let userEntry = await userRepo.create({
                firstName: user.firstName,
                lastName: user.lastName,
                passwordHash: hash,
                email: user.email,
                birthDate: new Date(user.birthDate),
                weight: user.weight,
                sex: user.sex,
                height: user.height,
                messages: [],
                // role: "user"
            })
            await userRepo.save(userEntry)
            await authenticate(user, res)
            res.json({
                ok: true
            })

        }
    },
    {
        path: "/signin",
        secure: false,
        role: "user",
        action: async (req, res) => {
            const { email, password } = req.body
            const userRepo = getCustomRepository(UserRepository)
            const userEntry = await userRepo.findByEmail(email)
            if(!userEntry) {
                res
                    .status(401)
                    .json({
                        ok: false,
                        err: "User not found"
                    })
            } else {
                let isValid = await bcrypt.compare(password, userEntry.passwordHash)
                if (isValid) {
                    await authenticate(userEntry, res)
                    res
                        .json({
                            ok: true
                        })
                } else {
                    res
                        .status(401)
                        .json({
                            ok: false,
                            err: "Invalid password"
                        })
                }
            }
        }
    },
    {
        path: "/signout",
        secure: true,
        role: "user",
        action: async (req, res, user) => {
            await unauthenticate(user, res)
            res
                .json({
                    ok: true
                })
        }
    }
]

const AdminRoutes: Handler[] = [
    {
        method: "get",
        path: "/",
        secure: true,
        role: "admin",
        action: async (req, res, conn) => {

        }
    }
]

const SystemRoutes: Handler[] = [
    {
        method: "get",
        path: "/system",
        secure: false,
        role: "system",
        action: async (req, res, user) => {
            res.json({
                ok: true
            })
        }
    }
]




// test
axios.post(rasaconfig.url, {
    message: "Hello", sender: "hakim"
}).then(res => console.log(res.data))
// ======




createConnection().then(async (connection: Connection) => {
    const app = express();

    app.use(bodyParser.json())
    app.use(cookieParser())

    const Routes = [...AppRoutes, ...AdminRoutes, ...SystemRoutes]

    Routes.forEach(route => {
        app[route.method?.toLowerCase() || "get" ](route.path, [
            route.secure ? authorize(route.role) : (req, res, next) => next(),
            (req: Request, res: Response, next: Function) => {
                route.action(req, res, req.user)
                    .then(() => next())
                    .catch(err => next(err))
            }
        ])
    })

    app.listen(80, () => {
        console.log("Server is listening on port 80")
    })
}).catch(error => console.log(error));
