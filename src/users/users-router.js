const express = require('express')
const path = require('path')
const UsersService = require('./users-service')
const usersRouter = express.Router()
const jsonBodyParser = express.json()

usersRouter
  .post('/', jsonBodyParser, (req, res, next) => {
      const { password, user_name, full_name, nickname } = req.body

      for (const field of ['full_name', 'user_name', 'password'])
      if(!req.body[field])
        return res.status(400).json({
            error: `Missing '${field}' in request body` 
        })
        // if(password.length < 8){
        //     return res.status(400).json({
        //         error: 'Password must be longer than 8 characters'
        //     })
        // }
        const passwordError = UsersService.validatePassword(password)

        if(passwordError)
            return res.status(400).json({ error : passwordError })

        UsersService.hasUserWithUserName(
            req.app.get('db'),
            user_name
        )
            .then(hasUserWithUserName => {
                if(hasUserWithUserName){
                    return res.status(400).json({ error: `Username already taken` })
                }
                return UsersService.hashPassword(password)
                        .then(hashedPassword => {
                //res.send('ok')
                // res.status(201)
                // .location(path.posix.join(req.originalUrl, `/whatever`))
                // .json({
                //     id: 'whatever',
                //     user_name,
                //     full_name,
                //     nickname: nickname || '',
                //     date_created: Date.now(),
                // })
                const newUser = {
                    user_name,
                    password: hashedPassword,
                    full_name,
                    nickname,
                    date_created: 'now()',
                }

                return UsersService.insertUser(
                    req.app.get('db'),
                    newUser
                )
                    .then(user => {
                        res 
                            .status(201)
                            .location(path.posix.join(req.originalUrl, `/${user.id}`))
                            .json(UsersService.serializeUser(user))
                    })
                })
            })
            .catch(next)
  })

module.exports = usersRouter