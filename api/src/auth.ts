import * as passport from "passport"
import {Strategy} from "passport-jwt"
import { getCustomRepository } from "typeorm"
import { User, UserRepository} from "./entity/User"
import * as jwt from "jsonwebtoken"
import { Response, Request } from "express"

passport.use(
    new Strategy({
        secretOrKey: "signsecret",
        jwtFromRequest: req => {
            let token = null
            if(req && req.cookies) {
                token = req.cookies["authToken"]
            }
            return token
        }
    }, (payload, done) => {
        const userRepo = getCustomRepository(UserRepository)
        userRepo.findById(payload.user_id)
            .then(u => done(null, u))
            .catch(err => done(err, false))
    })
)

export const authorize = (role: string) => (req: Request, res: Response, next) => {
    passport.authenticate("jwt", (err, user, info) => {
        if (err) return next(err)
        if (user) {
            if(user.role === role) {
                req.user = user
                return next()
            } else {
            return res
                .status(401)
                .json({
                    err: "Role unauthorized",
                    user,
                    ok: false
                })
            }
        }
        return res
            .status(403)
            .json({
                err: "Unauthorized request",
                ok: false
            })
    })
}

export const authenticate: (user: User, response: Response) => Promise<void> = (user, response) => new Promise((res, rej) => {
    jwt.sign({
        user_id: user.id
    }, "signsecret", (err, token) => {
        if (err) return rej(err)
        response
            .cookie("authToken", token, {
                domain: "gympapmt.de"
            })
        res()
    })
})

export const unauthenticate: (user: User, response: Response) => Promise<void> = (user, response) => new Promise((res, rej) => {
    response.clearCookie("authToken");
})