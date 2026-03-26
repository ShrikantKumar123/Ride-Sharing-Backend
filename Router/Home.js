const express = require('express');
const homePage = require('../Controller/Home-Controller')

const homeRouter = express.Router()


homeRouter.get('/', homePage)


module.exports = homeRouter