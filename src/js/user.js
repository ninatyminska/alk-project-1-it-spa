import { router } from './router';
import { errorMsg, api } from './helpers';

export const isUserAuthenticated = async () => {
    try {
        const response = await api.get('/user');
        const data = response.data;

        if (data === true) {
            $('a[href$="/logowanie"]').hide();
            $('a[href$="/wylogowanie"]').css('display', 'inline-block');
            $('a[href$="/konto"]').css('display', 'inline-block');
        } else {
            $('a[href$="/logowanie"]').css('display', 'inline-block');
            $('a[href$="/wylogowanie"]').hide();
            $('a[href$="/konto"]').hide();
        }
    } catch (err) {
        console.log(err);
    }
};

const userRegisterHandler = async () => {
    const mail = $('#mail').val();
    const pass = $('#pass').val();

    try {
        const response = await api.post('/user/register', {
            mail,
            pass,
        });
        const data = response.data;

        if (data.name === 'UserExistsError') {
            $('.alert').remove();
            $('.register__header').append(
                '<div class="alert alert-danger" role="alert">Konto z takim adresem e-mail już istnieje.</div>'
            );
            $('#username').addClass('is-invalid');
        } else if (data.errors) {
            $('.alert').remove();
            $('.register__header').append(
                '<div class="alert alert-danger" role="alert"></div>'
            );

            for (const error in data.errors) {
                $('.alert').append(data.errors[error].msg + '<br />');
                $('#' + data.errors[error].param).addClass('is-invalid');
            }
        }

        if (data === 'success') {
            router.navigateTo('/');

            $('.alert').remove();
            $('.home').prepend(
                '<div class="alert alert-success" role="alert">Rejestracja pomyślna!</div>'
            );
        }

        if (data === 'error') {
            $('.alert').remove();
            $('.register__header').append(errorMsg);
        }
    } catch (err) {
        $('.alert').remove();
        $('.register__header').append(errorMsg);
    }
};

const userLoginHandler = async () => {
    const mail = $('#mail').val();
    const pass = $('#pass').val();

    try {
        const response = await api.post('/user/login', {
            withCredentials: true,
            mail,
            pass,
        });
        const data = response.data;

        if (data.message === 'Missing credentials') {
            $('.alert').remove();
            $('.login__header').append(
                `<div class="alert alert-danger" role="alert">Podaj dane logowania.</div>`
            );
            $('#mail').addClass('is-invalid');
            $('#pass').addClass('is-invalid');
        }

        if (data.name === 'IncorrectUsernameError') {
            $('.alert').remove();
            $('.login__header').append(
                `<div class="alert alert-danger" role="alert">Niepoprawna nazwa użytkownika.</div>`
            );
            $('#mail').addClass('is-invalid');
        }

        if (data.name === 'IncorrectPasswordError') {
            $('.alert').remove();
            $('.login__header').append(
                `<div class="alert alert-danger" role="alert">Niepoprawne hasło.</div>`
            );
            $('#pass').addClass('is-invalid');
        }

        if (data === 'success') {
            router.navigateTo('/');

            $('.alert').remove();
            $('.home').prepend(
                '<div class="alert alert-success" role="alert">Zalogowano.</div>'
            );
        }

        if (data === 'error') {
            $('.alert').remove();
            $('.register__header').append(errorMsg);
        }
    } catch (err) {
        $('.alert').remove();
        $('.login__header').append(errorMsg);
    }
};

export const userRegisterSendHandler = () => {
    $(':input').each(() => {
        $(this).removeClass('is-invalid');
    });
    userRegisterHandler();
    return false;
};

export const userLoginSendHandler = () => {
    $(':input').each(() => {
        $(this).removeClass('is-invalid');
    });
    userLoginHandler();
    return false;
};
