import { errorMsg, database } from './helpers';

export const deleteOrder = async (target) => {
    try {
        const targetId = $(target).attr('data-id');
        const response = await database.get(`/order/delete/${targetId}`);
        const data = response.data;

        if (data === 'success') {
            $('#order-cancel').modal('hide');
            $('.alert').remove();
            $('.account__header').append(
                '<div class="alert alert-success" role="alert">Rezerwacja anulowana.</div>'
            );
            $(`#${targetId}`).remove();
        }

        if (data === 'no orders') {
            $('#order-cancel').modal('hide');
            $('.alert').remove();
            $('.account__header').append(
                '<div class="alert alert-success" role="alert">Rezerwacja anulowana.</div>'
            );
            $('.account__content').html(`
                    <div class="row w-100 pb-4 justify-content-center">
                    <img src="img/no-orders.png" class="account__content--img" />
                    </div>
                    <div class="row w-100 justify-content-center">
                    <p>Nie masz żadnych zamówień</p>
                    </div>`);
        }

        if (data === 'error') {
            $('#order-cancel').modal('hide');
            $('.alert').remove();
            $('.account__header').append(errorMsg);
        }
    } catch (err) {
        $('.alert').remove();
        $('.account__header').append(errorMsg);
    }
};
