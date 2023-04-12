import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class PageNotFoundsController {
    async handle({view}: HttpContextContract){

        return view.render('errors/not-found');
    }
}
