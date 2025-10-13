import {MD5} from 'crypto-js';
import {User} from "@/interfaces/User";
import {Article} from "@/interfaces/Article";
import {Request} from "@/interfaces/Request";
import {API_URL, API_URL_OLD, SERVICE} from "@/constants";
import {int} from "@zxing/library/es2015/customTypings";

export default class ApiService {
    static async login(customerNumber: string, username: string, password: string): Promise<boolean> {
        let isAuthenticated = false;
        const checkkdnr = await fetch(API_URL_OLD, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams(
                {
                    'service': SERVICE,
                    'checkkdnr': customerNumber
                }
            )
        });
        const result = await checkkdnr.text();

        if (result === 'true') {
            const getuser = await fetch(API_URL_OLD, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams(
                    {
                        'service': SERVICE,
                        'getuser': customerNumber
                    }
                )
            });
            const users = await getuser.text();
            const userList: User[] = users.split('<->').map((user) => {
                const fields = user.split('<|>');
                return {
                    id: fields[0],
                    name: fields[1],
                    lastname: fields[2],
                    login: fields[3],
                    pwhash: fields[4],
                    mainuser: fields[5],
                }
            });
            let digest = '';

            for (const user of userList) {
                digest = MD5(username + password).toString();

                if (user.login === username && user.pwhash === digest) {
                    const userRights = await fetch(API_URL, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                        },
                        body: new URLSearchParams(
                            {
                                'action': 'getUserRights',
                                'userId': user.id
                            }
                        )
                    });
                    const result = await userRights.json();
                    console.log('fetched rights: ', result);
                    if (Array.isArray(result)) {
                        const rights = result.map((right: any) => ({ id: right.rechteid, name: right.rechtebezeichnung }));
                        // check if user has permission to login (id 10 || 11)
                        const hasLoginPermission = rights.some((right: any) => right.id === 11 || right.id === 10);
                        if (!hasLoginPermission) {
                            alert("Fehler: Keine Berechtigung zum Einloggen.");
                            return false;
                        }
                        localStorage.setItem('userRights', JSON.stringify(rights));
                    } else if (result.error) {
                        alert("Fehler beim Abrufen der Benutzerrechte.");
                        return false;
                    }
                    isAuthenticated = true;

                    localStorage.setItem('userData', JSON.stringify(user))
                    localStorage.setItem('customerNumber', customerNumber)
                    localStorage.setItem('isAuthenticated', String(isAuthenticated))
                    break;
                }
            }
            if (!isAuthenticated) {
                alert("Fehler: Benutzername oder Passwort falsch!");
            }
        } else {
            alert("Fehler: Kundennummer nicht gefunden!");
        }
        return isAuthenticated;
    }

    static async logout(): Promise<void> {
        localStorage.removeItem('userData');
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('customerNumber');
        localStorage.removeItem('userRights');
    }

    static async getArticles(): Promise<Article[]> {
        const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
        const customerNumber = localStorage.getItem('customerNumber');
        if (isAuthenticated) {
            const articles = await fetch (API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams(
                    {
                        'action': 'listArticles',
                        'customerNumber': customerNumber || '',
                    }
                )
            });
            const result = await articles.json();
            if (Array.isArray(result)) {
                return result.map((article: any): Article => {
                    return {
                        articleNumber: article.articleNumber,
                        description: article.description,
                        description2: article.description2,
                        EAN: article.EAN,
                        barCode: article.barCode,
                        amount: article.amount,
                        minAmount: article.minAmount,
                        price: article.price,
                        category: article.category,
                        filter: article.filter,
                        image: article.image,
                        articleUnit: article.articleUnit,
                        customerUnit: article.customerUnit,
                    }
                });
            } else if (result.error) {
                alert("Beim Abrufen der Artikel ist ein Fehler aufgetreten.");
            }
        }
        return [];
    }

    static async reduceAmount(customerNumber: string, articleNo: string, reducedBy: int) {
        const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
        const userId = JSON.parse(localStorage.getItem('userData') || '{}').id;
        const params = new URLSearchParams();
        params.append('action', 'reduceAmount');
        params.append('customerNumber', customerNumber);
        params.append('userId', userId);
        params.append('articleNo', articleNo);
        params.append('reducedBy', String(reducedBy));
        if (isAuthenticated) {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: params.toString(),
            });
            const result = await response.json();
            if (result.error) {
                alert('Fehler beim Aktualisieren des Artikels.');
            }
            return result;
        }
        return {error: 'Not authenticated'};
    }

    static async changeAmount(customerNumber: string, articleNo: string, newAmount: string) {
        const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
        const userId = JSON.parse(localStorage.getItem('userData') || '{}').id;
        const params = new URLSearchParams();
        params.append('action', 'changeAmount');
        params.append('customerNumber', customerNumber);
        params.append('userId', userId);
        params.append('articleNo', articleNo);
        params.append('newAmount', newAmount);
        if (isAuthenticated) {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: params.toString(),
            });
            const result = await response.json();
            if (result.error) {
                alert('Fehler beim Aktualisieren des Artikels.');
            }
            return result;
        }
        return {error: 'Not authenticated'};
    }

    static async changeMinAmount(customerNumber: string, articleNo: string, newMinAmount: string) {
        const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
        const params = new URLSearchParams();
        const userId = JSON.parse(localStorage.getItem('userData') || '{}').id;
        params.append('action', 'changeMinAmount');
        params.append('customerNumber', customerNumber);
        params.append('userId', userId);
        params.append('articleNo', articleNo);
        params.append('newMinAmount', newMinAmount);
        if (isAuthenticated) {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: params.toString(),
            });
            const result = await response.json();
            if (result.error) {
                alert('Fehler beim Aktualisieren des Artikels.');
            }
            return result;
        }
        return {error: 'Not authenticated'};
    }

    static async findArticleByBarcode(articleEan: string, customerNumber: string) {
        const params = new URLSearchParams();
        params.append('action', 'findArticleByBarcode');
        params.append('barcode', articleEan);
        params.append('customerNumber', customerNumber);
        const article = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: params.toString(),
        });
        const result = await article.json();
        if (result.error) {
            alert('Keinen Artikel mit dem Barcode ' + articleEan + ' gefunden: ');
        }
        return result;
    }

    static async getCriticalItems(customerNumber: string) {
        const params = new URLSearchParams();
        params.append('action', 'getCriticalStock');
        params.append('customerNumber', customerNumber);
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: params.toString(),
        });
        const result = await response.json();
        if (result.error) {
            alert('Fehler beim Abrufen der kritischen Artikel.');
        }
        return result;
    }

    static async getFiltersAndTypes(customerNumber: string) {
        const params = new URLSearchParams();
        params.append('action', 'getFiltersAndTypes');
        params.append('customerNumber', customerNumber);
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: params.toString(),
        });
        const result = await response.json();
        if (result.error) {
            alert('Fehler beim Abrufen der Filter und Typen.');
        }
        return result;
    }

    static async getRequests(customerNumber: string): Promise<Request[]> {
        const userId = JSON.parse(localStorage.getItem('userData') || '{}').id;
        const params = new URLSearchParams();
        params.append('action', 'getRequests');
        params.append('customerNumber', customerNumber);
        params.append('userId', userId);
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: params.toString(),
        });
        const result = await response.json();
        if (Array.isArray(result)) {
            return result.map((request: any): Request => {
                return {
                    id: request.anfrageid,
                    text: request.text,
                };
            }).sort((a, b,) => Number.parseInt(b.id) - Number.parseInt(a.id));
        } else if (result.error) {
            alert('Fehler beim Abrufen der Anfragen.');
        }
        return [];
    }

    static async sendRequest(customerNumber: string, subject: string, requestText: string) {
        const userId = JSON.parse(localStorage.getItem('userData') || '{}').id;
        const params = new URLSearchParams();
        params.append('action', 'sendRequest');
        params.append('customerNumber', customerNumber);
        params.append('userId', userId);
        params.append('subject', subject);
        params.append('requestText', requestText);
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: params.toString(),
        });
        const result = await response.json();
        if (result.error) {
            alert('Fehler beim Senden der Anfrage.');
        }
        return result;
    }

    static async getEditHistory(customerNumber: string, articleNo: string) {
        const params = new URLSearchParams();
        params.append('action', 'getEditHistory');
        params.append('customerNumber', customerNumber);
        params.append('articleNo', articleNo);
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: params.toString(),
        });
        const result = await response.json();
        if (result.error) {
            alert('Fehler beim Abrufen der Bearbeitungshistorie.');
        }
        return result;
    }
}