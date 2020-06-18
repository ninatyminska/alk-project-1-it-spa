import { router } from './router';
import { tns } from 'tiny-slider/src/tiny-slider';

import '../sass/main.scss';

import {
    homeTemplate,
    roomsTemplate,
    treatmentsTemplate,
    registerTemplate,
    loginTemplate,
    accountTemplate,
    basketTemplate,
} from './hdbTemplates';

import {
    isUserAuthenticated,
    userRegisterSendHandler,
    userLoginSendHandler,
} from './user';

import {
    addRoomToBasket,
    addTreatmentToBasket,
    removeItem,
    deleteItem,
    checkout,
} from './basket';

import { deleteOrder } from './order';

import { navigateToPath, database, api, errorMsg } from './helpers';

window.addEventListener('load', () => {
    const el = $('.main__content--app');

    router.add('/', async () => {
        try {
            await isUserAuthenticated();

            const html = homeTemplate();
            el.html(html);

            $('.main__content--loader').fadeOut();

            const slider = tns({
                container: '.home__slider',
                mode: 'gallery',
                autoplay: true,
                controls: false,
                nav: false,
                autoplayButtonOutput: false,
                speed: 500,
                autoplayTimeout: 10000,
            });
        } catch (err) {
            $('.alert').remove();
            $('.home').prepend(errorMsg);
        }
    });

    router.add('/pokoje', async () => {
        try {
            await isUserAuthenticated();

            const response = await database.get('/rooms');
            const data = response.data;

            const html = roomsTemplate({ data: data });
            el.html(html);

            $('.main__content--loader').fadeOut();

            $('.btn').on('click', (e) => {
                e.preventDefault();
                const target = $(e.currentTarget);
                addRoomToBasket(target);
            });

            $('.rooms__date--arr')
                .datepicker({
                    orientation: 'bottom right',
                    format: 'dd/mm/yyyy',
                    todayHighlight: true,
                    autoclose: true,
                })
                .on('changeDate', (e) => {
                    let date = new Date(e.date);
                    date.setDate(date.getDate() + 1);
                    $('.rooms__date--dep').datepicker('setStartDate', date);
                })
                .on('clearDate', () => {
                    $('.rooms__date--arr')
                        .datepicker('setStartDate', '0d')
                        .datepicker('setEndDate', false);
                });

            $('.rooms__date--dep')
                .datepicker({
                    orientation: 'bottom right',
                    format: 'dd/mm/yyyy',
                    todayHighlight: false,
                    autoclose: true,
                })
                .on('changeDate', (e) => {
                    let date = new Date(e.date);
                    date.setDate(date.getDate() - 1);
                    $('.rooms__date--arr').datepicker('setEndDate', date);
                })
                .on('clearDate', () => {
                    $('.rooms__date--dep')
                        .datepicker('setStartDate', '0d')
                        .datepicker('setEndDate', '+365d');
                });
        } catch (err) {
            $('.alert').remove();
            $('.rooms__header').append(errorMsg);
        }
    });

    router.add('/zabiegi', async () => {
        try {
            await isUserAuthenticated();

            const response = await database.get('/treatments');
            const data = response.data;

            const html = treatmentsTemplate({ data: data });
            el.html(html);

            $('.main__content--loader').fadeOut();

            $('.btn').on('click', (e) => {
                e.preventDefault();
                const target = $(e.currentTarget);
                addTreatmentToBasket(target);
            });
        } catch (err) {
            $('.alert').remove();
            $('.treatments__header').append(errorMsg);
        }
    });

    router.add('/rejestracja', async () => {
        try {
            await isUserAuthenticated();

            const html = registerTemplate();
            el.html(html);

            $('.main__content--loader').fadeOut();

            $('.btn').click(userRegisterSendHandler);
        } catch (err) {
            $('.alert').remove();
            $('.register__header').append(errorMsg);
        }
    });

    router.add('/logowanie', async () => {
        try {
            await isUserAuthenticated();

            const html = loginTemplate();
            el.html(html);

            navigateToPath();

            $('.main__content--loader').fadeOut();

            $('.btn').click(userLoginSendHandler);
        } catch (err) {
            $('.alert').remove();
            $('.login__header').append(errorMsg);
        }
    });

    router.add('/wylogowanie', async () => {
        try {
            await isUserAuthenticated();

            const response = await api.get('/user/logout');
            const data = response.data;

            router.navigateTo('/');

            if (data === 'logout') {
                setTimeout(function() {
                    $('.alert').remove();
                    $('.home').prepend(
                        '<div class="alert alert-success" role="alert">Wylogowano.</div>'
                    );
                }, 100);
            } else {
                setTimeout(function() {
                    $('.alert').remove();
                    $('.home').prepend(errorMsg);
                }, 100);
            }
        } catch (err) {
            router.navigateTo('/');

            setTimeout(function() {
                $('.alert').remove();
                $('.home').prepend(errorMsg);
            }, 100);
        }
    });

    router.add('/konto', async () => {
        try {
            await isUserAuthenticated();

            const response = await api.get('/user/account');
            const data = response.data;

            const html = accountTemplate({ data: data });
            el.html(html);

            $('.main__content--loader').fadeOut();

            if (data.length === 0) {
                $('.account__content').append(`
                <div class="row w-100 pb-4 justify-content-center">
                <img src="img/no-orders.png" class="account__content--img" />
                </div>
                <div class="row w-100 justify-content-center">
                <p>Nie masz żadnych zamówień</p>
                </div>`);
            }

            $('.fa-plane-slash').on('click', (e) => {
                e.preventDefault();

                const target = $(e.currentTarget);
                const orderId = $(target).attr('data-order');

                $('.confirm-cancel').attr('data-id', orderId);
            });

            $('.confirm-cancel').on('click', async (e) => {
                try {
                    e.preventDefault();

                    const target = $(e.currentTarget);
                    await deleteOrder(target);
                } catch (err) {
                    $('.alert').remove();
                    $('.account__header').append(errorMsg);
                }
            });

            if (data === 'not logged') {
                $('.account__header').append(
                    '<div class="alert alert-danger" role="alert">Musisz się najpierw zalogować</div>'
                );

                $('.account__content').html('').append(`
                    <div class="row w-100 pb-4 justify-content-center">
                    <img src="img/user.svg" class="account__content--img" />
                    </div>
                    <div class="row w-100 justify-content-center">
                    <a href="/logowanie">Przejdź do strony logowania</a>
                    </div>`);

                navigateToPath();
            }
        } catch (err) {
            $('.alert').remove();
            $('.account__header').append(errorMsg);
        }
    });

    router.add('/koszyk', async () => {
        try {
            await isUserAuthenticated();

            const response = await database.get('/basket');
            const data = response.data;

            if (data.totalQty && data.totalQty !== 0) {
                const html = basketTemplate({ data: data });
                el.html(html);

                $('.main__content--loader').fadeOut();

                $('.fa-minus-square').on('click', (e) => {
                    e.preventDefault();
                    const target = $(e.currentTarget);
                    removeItem(target);
                });

                $('.fa-trash-alt').on('click', (e) => {
                    e.preventDefault();
                    const target = $(e.currentTarget);
                    deleteItem(target);
                });

                $('.btn').click(checkout);
            } else {
                const html = `<div class="basket">
                <div class="basket__header">
                    <div class="row h-100">
                        <div class="col-12 align-self-center">
                            <h3>Koszyk</h3>
                        </div>
                    </div>
                </div>
                <div class="basket__content d-flex justify-content-center flex-column">
                    <div class="row w-100 pt-5 justify-content-center">
                        <img src="img/empty-basket.png" class="basket__content--img" alt="Koszyk jest pusty" />
                    </div>
                    <div class="row w-100 p-5 justify-content-center">    
                        <p>Twój koszyk jest pusty.</p>
                    </div>
                </div>
            </div>`;
                el.html(html);

                $('.main__content--loader').fadeOut();
            }
        } catch (err) {
            $('.alert').remove();
            $('.basket__header').append(errorMsg);
        }
    });

    router.navigateTo(window.location.pathname);

    navigateToPath();
});
