import { Router } from "express";
import { UsersManager } from "../../dao/userManager.js";
import { createHash, isValidPass } from "../../utils/bcrypt.js";
import passport from 'passport'

export const sessionRouter = Router()
const userService = new UsersManager()


sessionRouter.get('/github', passport.authenticate('github', {scope: 'user:email'}), async (req, res)=>{})


sessionRouter.get('/githubcallback', passport.authenticate('github', {failureRedirect: '/login'}), (req,res) =>{
    req.session.user = req.user
    res.redirect('/home')
})

// sessionRouter.post('/register', async (req, res) => {
//     try {
//         const { first_name, last_name, email, password } = req.body

//         //valido si vienen los datos
//         if (!email || !password) return res.status(401).send({stautus: 'error', error: 'se deben completar todos los datos'})

//         //valido si existe el usuario
//         const userExist = await userService.getUserBy({email})
//         if (userExist) return res.status(401).send({status: 'error', error: 'el usuario ya existe'})

//         const newUser = {
//             first_name,
//             last_name,
//             email,
//             password: createHash(password)
//         }

//         const result = await userService.createUser(newUser)

//         console.log(result)
//         res.send('usuario registrado')
//         res.redirect('/login')

//     } catch (error) {
//         console.log(error)
//     }
// })


// sessionRouter.post('/login', async (req, res) => {
//     const { email, password } = req.body

//     //valido si vienen los datos
//     if (!email || !password) return res.status(401).send({stautus: 'error', error: 'se deben completar todos los datos'})
//     // if(email !== 'natanael@gmail.com' || password !== 'test1234') return res.send('login failed')

//     const userFound = await userService.getUserBy({email})

//     if(!userFound) return res.status(400).send({status: 'error', error: 'usuario no encontrado'})

//     if(! isValidPass(password, {password: userFound.password})) return res.status(401).send({status: 'error', error: 'Password incorrecto'})

//     req.session.user = {
//         email,
//         admin: userFound.role === 'admin'
//     }

//     // console.log(req.session.user)
//     // res.send('login success')
//     res.redirect('/home')    
// })

sessionRouter.post('/register', passport.authenticate('register', {failureRedirect: '/failregister'}), async (req, res) => {
    res.send({status: 'success', message: 'User Registrado'})
})
sessionRouter.post('/failregister', async (req, res) => {
    console.log('falló la estrategia')
    res.send({error: 'failed'})
})

sessionRouter.post('/login', passport.authenticate('login', {failureRedirect: '/faillogin'}),async (req, res) => {
    if(!req.user) return res.status(400).send({status: 'error', error: 'credenciales invalidas'})
    req.session.user = {
        first_name: req.user.first_name,
        last_name: req.user.last_name,
        
        email: req.user.email
    }
    res.send({status: 'succes', payload: req.user})
})

sessionRouter.post('/faillogin', (req, res) => {
    res.send({error: 'falló el login'})
})

sessionRouter.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if(err) return res.send({status: 'error', error: err})
        else return res.redirect('/login')
    })
})