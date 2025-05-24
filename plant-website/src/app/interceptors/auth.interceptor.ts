import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Получаем данные текущего пользователя из localStorage
  const currentUserStr = localStorage.getItem('currentUser');

  // Если данные существуют, парсим их
  if (currentUserStr) {
    try {
      const currentUser = JSON.parse(currentUserStr);

      // Если у пользователя есть токен, добавляем его в заголовок запроса
      if (currentUser && currentUser.token) {
        req = req.clone({
          setHeaders: {
            Authorization: `Bearer ${currentUser.token}`
          }
        });
      }
    } catch (e) {
      console.error('Ошибка при парсинге данных пользователя:', e);
    }
  }

  // Продолжаем цепочку обработки запроса
  return next(req);
};
