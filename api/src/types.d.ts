import {Message, User, UserRepository} from "./entity/User";
import * as express from "express"

type ApplicationUser = User;

declare global {
    namespace Express {
        interface User extends ApplicationUser {}
    }
}