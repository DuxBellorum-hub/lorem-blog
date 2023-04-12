import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database';
import Post from 'App/Models/Post'
import UpdateBlogPostValidator from 'App/Validators/UpdateBlogPostValidator';
import { string } from '@ioc:Adonis/Core/Helpers'
import Drive from '@ioc:Adonis/Core/Drive'
 



export default class BlogPostsController {
    

    async index({ view, request, response }: HttpContextContract) {

        const page = request.input('page', 1);
        const posts = await Database.from(Post.table).orderBy('id', 'desc').paginate(page, 3);
        const redenredView = await view.render("blog/index", { posts });
        return response.send(redenredView)
    }

    async displayArticle({ params, view }: HttpContextContract) {
        const article = await Post.findOrFail(params.id);
        return view.render("blog/article", {
            article
        })

    }
    async createArticle({ view, response }: HttpContextContract) {
        const article = new Post();
        const renderedView = await view.render("blog/create", { article });
        return response.send(renderedView)

    }

    async store({ params, request, session, response }: HttpContextContract) {
        await this.handleRequest(params, request);
        session.flash({ success: 'Article publié' });
        return response.redirect().toRoute('home');
    }

    async updateArticle({ params, request, response, session }: HttpContextContract) {
        await this.handleRequest(params, request);
        session.flash({ success: 'Article sauvegardé' })
        return response.redirect().toRoute('home');

    }

    async deleteArticle({ params, session, response }: HttpContextContract) {
        const article = await Post.findOrFail(params.id);
        await article.delete();
        session.flash({ success: 'Article supprimé !' });
        return response.redirect().toRoute('home');

    }

    async handleRequest(params: HttpContextContract['params'], request: HttpContextContract['request']) {
        const article = params.id ? await Post.findOrFail(params.id) : new Post();
        const thumbnail = request.file('thumbnail');
        const data = await request.validate(UpdateBlogPostValidator);
        const imgPlaceholder = 'https://loremflickr.com/700/350/abstract';
        if (!thumbnail) {
            article.thumbnail = imgPlaceholder;
        }
        else {
            if (article.thumbnail) {
                await Drive.delete(article.thumbnail);
            }
            const fileName = string.generateRandom(32) + '.' + thumbnail.extname;
            await thumbnail.moveToDisk('./', { name: fileName });
            article.thumbnail = fileName;
        }
        article
            .merge({ title: data.title, content: data.content })
            .save();
    }
}
