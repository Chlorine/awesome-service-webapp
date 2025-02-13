import { omit } from 'lodash';
import { ApiResults, GenericObject, UploadParamsBase } from './common';

export const DEV_API_PORT = Number(process.env.REACT_APP_DEV_API_PORT || 3301);
export const DEV_API_HOSTNAME = window.location.hostname;

// https://developer.mozilla.org/ru/docs/Web/API/Fetch_API/Using_Fetch

export const IS_PRODUCTION = process.env.NODE_ENV === 'production';

export class ServerAPIBase {
  static URL = IS_PRODUCTION
    ? `https://api.cloudtickets.io/api`
    : `http://${DEV_API_HOSTNAME}:${DEV_API_PORT}/api`;

  async executeRequest(
    body: GenericObject,
    path: string = '/execute',
    method: 'POST' | 'GET' = 'POST',
  ): Promise<ApiResults> {
    const tm = new Date().getTime();

    const action = body.action || '';
    const target = body.target || 'core';

    console.log(
      `API: ${method} ${ServerAPIBase.URL + path}`,
      omit(body, ['password', 'newPassword', 'oldPassword']),
    );

    if (body.__delay) {
      await new Promise(resolve => setTimeout(resolve, body.__delay));
    }

    const fetchOpts: RequestInit = {
      method,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      credentials:
        process.env.NODE_ENV !== 'production' ? 'include' : 'same-origin',
      body: 'POST' === method ? JSON.stringify(body) : null,
    };

    // TODO: когда-нибудь нормально понять за CORS
    fetchOpts.credentials = 'include';

    let response: Response;

    try {
      response = await fetch(ServerAPIBase.URL + path, fetchOpts);
    } catch (err) {
      console.error(`API: ${target}|${action} ERROR: ${err.message}`);
      throw new Error('Нет ответа от сервера');
    }

    const { ok, status, statusText } = response;

    let json: ApiResults;

    // у нас должно быть application/json даже когда не "200 OK"

    try {
      json = await response.json();
    } catch (err) {
      json = {
        success: false,
        errorMsg: ok
          ? `Некорректный ответ сервера (JSON parsing failed (${err}))`
          : `Не удалось получить ответ от сервера (${status} ${statusText})`,
      };
    }

    const et = `${new Date().getTime() - tm} ms`;

    if (!json.success) {
      console.error(`API: ${target}|${action} ERROR: ${json.errorMsg} (${et})`);
      throw new Error(json.errorMsg || 'Неизвестная ошибка');
    }

    console.log(
      `API: ${target}|${action} ${status} ${statusText} (${et})`,
      json,
    );

    return json;
  }

  /**
   * Залить нечто на сервер
   * Если по params.type подразумевается, то вернется непустой publicUrl
   *
   * @param params
   * @param blob
   */
  async upload(
    params: UploadParamsBase,
    blob: Blob,
  ): Promise<{ publicUrl?: string }> {
    const tm = new Date().getTime();

    const fd = new FormData();
    fd.append('type', params.type);
    fd.append('objectId', params.objectId);
    fd.append('file', blob);

    const fetchOpts: RequestInit = {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        // content-type самовозникнет
      },
      credentials: 'include',
      body: fd,
    };

    let response: Response;

    try {
      response = await fetch(ServerAPIBase.URL + '/upload', fetchOpts);
    } catch (err) {
      console.error(`API.Upload: ERROR: ${err.message}`);
      throw new Error('Нет ответа от сервера');
    }

    const { ok, status, statusText } = response;

    let json: ApiResults & { publicUrl?: string };

    // у нас должно быть application/json даже когда не "200 OK"

    try {
      json = await response.json();
    } catch (err) {
      json = {
        success: false,
        errorMsg: ok
          ? `Некорректный ответ сервера (JSON parsing failed (${err}))`
          : `Не удалось получить ответ от сервера (${status} ${statusText})`,
      };
    }

    const et = `${new Date().getTime() - tm} ms`;

    if (!json.success) {
      console.error(`API.Upload: ERROR: ${json.errorMsg} (${et})`);
      throw new Error(json.errorMsg || 'Неизвестная ошибка');
    }

    console.log(`API.Upload: ${status} ${statusText} (${et})`, json);

    return json;
  }
}
