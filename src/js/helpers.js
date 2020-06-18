import { router } from './router';

export const navigateToPath = () => {
    $('a').on('click', (event) => {
        const target = $(event.currentTarget);

        const checkLinkClass = target.hasClass('footer__content--extlink');

        if (!checkLinkClass) {
            event.preventDefault();

            $('.main__content--loader').css('display', 'flex');

            const href = target.attr('href');
            const path = href.substr(href.lastIndexOf('/'));
            router.navigateTo(path);

            if (target.hasClass('nav-link')) {
                $('.navbar-collapse').removeClass('show');
            }
        }
    });
};

export const api = axios.create({
    baseURL: '/api',
    timeout: 5000,
});

export const database = axios.create({
    baseURL: '/database',
    timeout: 5000,
});

export const errorMsg =
    '<div class="alert alert-danger" role="alert">Wystąpił błąd. Wiesz, jak to jest... Spróbuj ponownie.</div>';
