import { errorMsg, database } from './helpers';

export const addRoomToBasket = async (target) => {
    try {
        const targetId = $(target).attr('data-id');
        const dateArr = $('.rooms__date--arr').val();
        const dateDep = $('.rooms__date--dep').val();

        if (!dateArr || !dateDep) {
            $('.alert').remove();
            $('.rooms__content').prepend(
                '<div class="alert alert-danger" role="alert">Wybierz okres pobytu.</div>'
            );
            $('.rooms__date--arr').addClass('is-invalid');
            $('.rooms__date--dep').addClass('is-invalid');
        } else {
            $('.rooms__date--arr').removeClass('is-invalid');
            $('.rooms__date--dep').removeClass('is-invalid');

            const response = await database.get(
                `/rooms/${targetId}/${dateArr.replace(
                    /\//g,
                    ''
                )}/${dateDep.replace(/\//g, '')}`
            );
            const data = response.data;

            if (data === 'added') {
                $('.alert').remove();
                $('.rooms__content').prepend(
                    '<div class="alert alert-success" role="alert">Pokój dodany do koszyka.</div>'
                );
                $('.rooms__date--arr').val('');
                $('.rooms__date--dep').val('');
            }

            if (data === 'exists') {
                $('.alert').remove();
                $('.rooms__content').prepend(
                    '<div class="alert alert-danger" role="alert">Dodałeś już ten pokój! Aby go usunąć, przejdź do koszyka.</div>'
                );
            }

            if (data === 'error') {
                $('.alert').remove();
                $('.rooms__content').prepend(errorMsg);
            }
        }
    } catch (err) {
        $('.alert').remove();
        $('.rooms__content').prepend(errorMsg);
    }
};

export const addTreatmentToBasket = async (target) => {
    try {
        const targetId = $(target).attr('data-id');
        const response = await database.get(`/treatments/${targetId}`);
        const data = response.data;

        if (data === 'added') {
            $('.alert').remove();
            $('.treatments__content').prepend(
                '<div class="alert alert-success" role="alert">Zabieg dodany do koszyka.</div>'
            );
        }

        if (data === 'max') {
            $('.alert').remove();
            $('.treatments__content').prepend(
                '<div class="alert alert-danger" role="alert">Możesz dodać maksymalnie 3 sesje jednego zabiegu. Aby edytować, przejdź do koszyka.</div>'
            );
        }

        if (data === 'error') {
            $('.alert').remove();
            $('.treatments__content').prepend(errorMsg);
        }
    } catch (err) {
        $('.alert').remove();
        $('.treatments__content').prepend(errorMsg);
    }
};

export const removeItem = async (target) => {
    try {
        const targetId = $(target).attr('data-id');
        const response = await database.get(`/basket/remove/${targetId}`);
        const data = response.data;

        $('.alert').remove();
        $('.basket__header').append(
            '<div class="alert alert-success" role="alert">Usunięto z koszyka.</div>'
        );

        if (!(targetId in data.items)) {
            $(`#${targetId}`).fadeOut();
            $('#basket-total-price').text(data.totalPrice);
        } else {
            $(`#qty-${targetId}`).text(data.items[targetId].qty);
            $('#basket-total-price').text(data.totalPrice);
        }

        if (data.totalQty === 0) {
            $('.basket__content').html(
                `<div class="row w-100 pb-5 justify-content-center">
                <img src="img/empty-basket.png" class="basket__content--img" alt="Koszyk jest pusty" />
            </div>
            <div class="row w-100 p-0 justify-content-center">    
                <p>Twój koszyk jest pusty.</p>
            </div>`
            );

            $('.alert').remove();
            $('.basket__header').append(
                '<div class="alert alert-success" role="alert">Usunięto z koszyka.</div>'
            );
        }
    } catch (err) {
        $('.alert').remove();
        $('.basket__header').append(errorMsg);
    }
};

export const deleteItem = async (target) => {
    try {
        const targetId = $(target).attr('data-id');
        const response = await database.get(`/basket/delete/${targetId}`);
        const data = response.data;

        $('.alert').remove();
        $('.basket__header').append(
            '<div class="alert alert-success" role="alert">Usunięto z koszyka.</div>'
        );

        if (!(targetId in data.items)) {
            $(`#${targetId}`).fadeOut();
            $('#basket-total-price').text(data.totalPrice);
        }

        if (data.totalQty === 0) {
            $('.basket__content').html(
                `<div class="row w-100 pb-5 justify-content-center">
                <img src="img/empty-basket.png" class="basket__content--img" alt="Koszyk jest pusty" />
            </div>
            <div class="row w-100 p-0 justify-content-center">    
                <p>Twój koszyk jest pusty.</p>
            </div>`
            );

            $('.alert').remove();
            $('.basket__header').append(
                '<div class="alert alert-success" role="alert">Usunięto z koszyka.</div>'
            );
        }
    } catch (err) {
        $('.alert').remove();
        $('.basket__header').append(errorMsg);
    }
};

export const checkout = async () => {
    try {
        const response = await database.get('/checkout');
        const data = response.data;

        if (data === 'empty') {
            $('.alert').remove();
            $('.basket__header').append(
                '<div class="alert alert-danger" role="alert">Dodaj najpierw coś do koszyka!</div>'
            );
        }

        if (data === 'not logged') {
            $('.alert').remove();
            $('.basket__header').append(
                '<div class="alert alert-danger" role="alert">Musisz się najpierw zalogować.</div>'
            );
        }

        if (data === 'success') {
            $('.alert').remove();
            $('.basket__header').append(
                '<div class="alert alert-success" role="alert">Twoje zamówienie zostało złożone. Dziękujemy!</div>'
            );
            $('.basket__content')
                .html(`<div class="basket__content d-flex justify-content-center flex-column">
            <div class="row w-100 pb-5 justify-content-center">
                <img src="img/empty-basket.png" class="basket__content--img" alt="Koszyk jest pusty" />
            </div>
            <div class="row w-100 p-0 justify-content-center">    
                <p>Twój koszyk jest pusty.</p>
            </div>
        </div>`);
        }

        if (data === 'error') {
            $('.alert').remove();
            $('.basket__header').append(errorMsg);
        }
    } catch (err) {
        $('.alert').remove();
        $('.basket__header').append(errorMsg);
    }
};
