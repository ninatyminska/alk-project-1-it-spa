import Router from 'vanilla-router';
import { errorTemplate } from './hdbTemplates';

export const router = new Router({
    mode: 'history',
    page404: () => {
        isUserAuthenticated();

        const html = errorTemplate();
        el.html(html);

        $('.main__content--loader').fadeOut();
    },
});
