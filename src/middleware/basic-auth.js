//const bcrypt = require('bcryptjs')
const AuthService = require('../auth/auth-service')

function requireAuth(req, res, next){
    // console.log('requireAuth')
    // console.log(req.get('Authorization'))
    const authToken = req.get('Authorization') || ''

    let basicToken
    if(!authToken.toLowerCase().startsWith('basic ')) {
        return res.status(401).json({ error: 'Missing basic token' })
    } else {
        basicToken = authToken.slice('basic '.length, authToken.length)
    }
    const [tokenUserName, tokenPassword] = AuthService.parseBasicToken(basicToken)
        // .from(basicToken, 'base64')
        // .toString()
        // .split(':')
    
    if(!tokenUserName || !tokenPassword) {
        return res.status(401).json({error : 'Unauthorized request'})
    }

    // req.app.get('db')('thingful_users')
    //     .where({ user_name : tokenUserName })
    //     .first()
    AuthService.getUserWithUserName(
        req.app.get('db'),
        tokenUserName
    )
        .then(user => {
            if(!user) {
                return res.status(401).json({error: 'Unauthorized request' })
            }
            // req.user = user
            // next()
            //return bcrypt.compare(tokenPassword, user.password)
              return AuthService.comparePasswords(tokenPassword, user.password)
                .then(passwordMatch => {
                    if(!passwordMatch) {
                        return res.status(401).json({ error: 'Unauthorized request' })
                    }
                    req.user = user
                    next()
                })
        })
    .catch(next)
}

module.exports = {
    requireAuth,
}