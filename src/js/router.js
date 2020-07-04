import Router from 'vanilla-router';
import { errorTemplate } from './hdbTemplates';
import { isUserAuthenticated } from './user';

window.addEventListener('load', () => {
    const el = $('.main__content--app');

    export const router = new Router({
        mode: 'history',
        page404: async () => {
            await isUserAuthenticated();

            const html = errorTemplate();
            el.html(html);

            $('.main__content--loader').fadeOut();
        },
    });
});