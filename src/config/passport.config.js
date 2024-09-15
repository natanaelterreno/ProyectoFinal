import passport from 'passport'
import local from 'passport-local'
import { UsersManager } from '../dao/userManager.js'
import { createHash, isValidPass } from '../utils/bcrypt.js'
import GithubStratetegy from 'passport-github2'

const LocalStrategy = local.Strategy
const userService = new UsersManager()

export const initializePassport = () => {
    // middleware -> estrategia -> local -> username(email), password
    passport.use('github', new GithubStratetegy({
        clientID:'Iv23liYYwqLCr60BVfaP',
        clientSecret:'2a917705ca718fa516ca65fb13104c244dc70e8c',
        callbackURL: 'http://localhost:8080/api/sessions/githubcallback'
       }, async (accesToken, refreshToken, profile, done)=>{
        try {
            console.log(profile)
            let user  = await userService.getUserBy({email: profile._json.email})
            // no existe el usuario en nuestra base de datos
            if(!user){
                let newUser = {
                    first_name: profile._json.name,
                    last_name: profile._json.name,
                    email: profile._json.email,
                    password: ''
                }
                let result = await userService.createUser(newUser) 
                done(null, result)
            }else{
                done(null, user)
            }
    
        } catch (err) {
            return done(err)
        }
       }) )


    // passport.use('register', new LocalStrategy({
    //     passReqToCallback: true, // req -> body -> passaport -> obj Req
    //     usernameField: 'email'
    // }, async( req, username, password, done ) => {
    //       const { first_name, last_name } = req.body
    //         try {
    //             // verificar si existe el usuario
    //             let userFound = await userService.getUserBy({email: username})
    //             if(userFound) {
    //                 console.log('el usuario ya existe')
    //                 return done(null, false)
    //             }
    //             // crear el uusario 
    //             let newUser = {
    //                 first_name,
    //                 last_name,
    //                 email: username,
    //                 password: createHash(password)
    //             }
    //             let result = await userService.createUser(newUser) // _id
    //             return done(null, result)
    //         } catch (error) {
    //             return done('error al registrar el usuario '+error)   
    //         }
    // }))

    // passport.use('login', new LocalStrategy({
    //     usernameField: 'email'
    // }, async(username, password, done)=>{
    //     try {
    //         const user = await userService.getUserBy({email: username})
    //         if(!user) {
    //             console.log('usuario no encontrado')
    //             return done(null, false)
    //         }
    //         if(!isValidPass(password, {password: user.password})) return done(null, false)
    //         return done(null, user) // req.user // password 
    //     } catch (error) {
    //         return done(error)
    //     }
    // }))

    passport.serializeUser((user, done)=>{
        done(null, user._id)
    }) // _id-> session

    passport.deserializeUser(async(id, done)=>{
        try {
            let user = await userService.getUserBy({_id: id})
            done(null, user)
        } catch (error) {
            done(error)
        }
    }) // session -> user
}
