import bcrypt from 'bcrypt'

export const createHash = password => bcrypt.hashSync(password, bcrypt.genSaltSync(10))

export const isValidPass = (password, user) => bcrypt.compareSync(password, user.password)