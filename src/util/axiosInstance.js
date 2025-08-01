//
// import axios from 'axios';
//
//
// let isRedirecting = false; // Flag to prevent multiple redirects/alerts
//
// const CookieManagerService = {
//     get: (key) => localStorage.getItem(key),
//     set: (value, key) => localStorage.setItem(key, value),
//     tokenIsExists: (key) => !!localStorage.getItem(key),
// };
//
// function parseJwt(token) {
//     try {
//         return JSON.parse(atob(token.split('.')[1]));
//     } catch {
//         return null;
//     }
// }
//
// function isTokenExpired(token) {
//     const decoded = parseJwt(token);
//     if (!decoded) return true;
//     const now = Date.now() / 1000;
//     return decoded.exp < now - 60;
// }
//
// async function refreshToken() {
//     const refreshToken = CookieManagerService.get('refresh_token');
//     if (!refreshToken) {
//         throw new Error("No refresh token found");
//     }
//
//     const params = new URLSearchParams();
//     params.append('grant_type', 'refresh_token');
//     params.append('client_id', 'hope-health-client');
//     params.append('refresh_token', refreshToken);
//
//     // eslint-disable-next-line no-useless-catch
//     try {
//         const response = await axios.post(
//             'http://localhost:8080/realms/hope-health-realm/protocol/openid-connect/token',
//             params,
//             {
//                 headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
//             }
//         );
//
//         const { access_token, refresh_token: newRefreshToken } = response.data;
//
//         CookieManagerService.set(access_token, 'access_token');
//         CookieManagerService.set(newRefreshToken, 'refresh_token');
//         return access_token;
//     } catch (error) {
//         throw error;
//     }
// }
//
// const axiosInstance = axios.create();
//
// axiosInstance.interceptors.request.use(async (config) => {
//     let token = CookieManagerService.get('access_token');
//
//     if (isRedirecting) {
//         return Promise.reject(new Error("Session expired, redirecting. Request aborted."));
//     }
//
//     if (!token || isTokenExpired(token)) {
//         try {
//             token = await refreshToken();
//         } catch (err) {
//             if (!isRedirecting) {
//                 isRedirecting = true;
//                 alert("Session Expired. Please log in again.");
//                 localStorage.removeItem("access_token")
//                 localStorage.removeItem("refresh_token")
//                 localStorage.removeItem("email")
//                 window.location.href = "/login";
//             }
//             return Promise.reject(err);
//         }
//     }
//
//     if (token) {
//         config.headers.Authorization = `Bearer ${token}`;
//     }
//
//     return config;
// }, (error) => {
//     return Promise.reject(error);
// });
//
// let refreshIntervalId;
//
// export function startTokenRefreshInterval() {
//     if (refreshIntervalId) {
//         console.log("refresh started")
//         clearInterval(refreshIntervalId);
//     }
//
//     refreshToken().catch(err => {
//         // Handle initial refresh failure if necessary, but don't redirect here
//         // as the interceptor will handle it on first protected request.
//     });
//
//     const TEN_MINUTES_IN_MS =  60 * 1000;
//     refreshIntervalId = setInterval(async () => {
//         try {
//             await refreshToken();
//             console.log("refreshing")
//         } catch (err) {
//             console.log(err)
//         }
//     }, TEN_MINUTES_IN_MS);
// }
//
// export function stopTokenRefreshInterval() {
//     if (refreshIntervalId) {
//         clearInterval(refreshIntervalId);
//         refreshIntervalId = null;
//     }
// }
//
// export default axiosInstance;


import axios from 'axios';

// Storage handler
const TokenService = {
    getAccessToken: () => localStorage.getItem('access_token'),
    getRefreshToken: () => localStorage.getItem('refresh_token'),
    setTokens: (access, refresh) => {
        localStorage.setItem('access_token', access);
        localStorage.setItem('refresh_token', refresh);
    },
    clear: () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('email');
    }
};

// JWT utils
const parseJwt = (token) => {
    try {
        return JSON.parse(atob(token.split('.')[1]));
    } catch {
        return null;
    }
};

const isTokenExpired = (token) => {
    const decoded = parseJwt(token);
    if (!decoded) return true;
    const now = Date.now() / 1000;
    return decoded.exp < now - 60; // 60 sec early buffer
};

// Refresh token API call
const refreshToken = async () => {
    const refresh = TokenService.getRefreshToken();
    if (!refresh) throw new Error("No refresh token found");

    const params = new URLSearchParams();
    params.append('grant_type', 'refresh_token');
    params.append('client_id', 'hope-health-client');
    params.append('refresh_token', refresh);

    const response = await axios.post(
        'http://localhost:8080/realms/hope-health-realm/protocol/openid-connect/token',
        params,
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    const { access_token, refresh_token: newRefresh } = response.data;
    TokenService.setTokens(access_token, newRefresh);
    return access_token;
};

// Axios instance
const axiosInstance = axios.create();

let isRedirecting = false;

axiosInstance.interceptors.request.use(async (config) => {
    let token = TokenService.getAccessToken();

    if (!token || isTokenExpired(token)) {
        try {
            token = await refreshToken();
        } catch (error) {
            if (!isRedirecting) {
                isRedirecting = true;
                alert("Session expired. Please log in again.");
                TokenService.clear();
                window.location.href = "/login";
            }
            return Promise.reject(error);
        }
    }

    config.headers.Authorization = `Bearer ${token}`;
    return config;
}, (error) => Promise.reject(error));

// Token refresh interval logic
let refreshIntervalId = null;

export const startTokenRefreshInterval = () => {
    if (refreshIntervalId) clearInterval(refreshIntervalId);

    const INTERVAL_MS = 2 * 60 * 1000; // 5 minutes
    refreshIntervalId = setInterval(async () => {
        try {
            await refreshToken();
            console.log("[Token Refreshed]");
        } catch (e) {
            console.error("Failed to refresh token in interval", e);
        }
    }, INTERVAL_MS);
};

export const stopTokenRefreshInterval = () => {
    if (refreshIntervalId) {
        clearInterval(refreshIntervalId);
        refreshIntervalId = null;
    }
};

export default axiosInstance;