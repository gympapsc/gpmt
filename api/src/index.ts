import "reflect-metadata";
import {Connection, createConnection, getCustomRepository, getRepository} from "typeorm";
import {Message, User, UserRepository} from "./entity/User";
import * as express from "express"
import { Request, Response } from "express"
import * as bodyParser from "body-parser"
import * as cookieParser from "cookie-parser"

interface Handler {
    method: string;
    path: string;
    action: (req: Request, res: Response, connection: Connection) => Promise<any>;
}

const AppRoutes: Handler[] = [
    {
        method: "get",
        path: "/",
        action: async (req: Request, res: Response, connection: Connection) => {
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
    }
]

createConnection().then(async (connection: Connection) => {
    const app = express();

    app.use(bodyParser.json())
    app.use(cookieParser())

    AppRoutes.forEach(route => {
        app[route.method.toLowerCase() || "get" ](route.path, (req: Request, res: Response, next: Function) => {
            route.action(req, res, connection)
                .then(() => next())
                .catch(err => next(err))
        })
    })


    app.listen(80, () => {
        console.log("Server is listening on port 80")
    })
}).catch(error => console.log(error));
