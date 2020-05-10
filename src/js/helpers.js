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
